import {join} from 'path';
import {parse, URLSearchParams} from 'url';
import {Exportable, OAutheable, ProgressReporter} from '.';
import {chunk} from '../helpers/arrayUtils';
import {createFolders, sanitizeFileName} from '../helpers/ioUtils';
import {downloadFile, performGetRequestWithBearerToken} from '../helpers/request';
import {UniqueNameResolver} from '../helpers/uniqueNameResolver';

const figmaHost = 'figma.com';
const apiBase = 'https://api.figma.com/v1/';
const isFigmaFileRegExp = /\.figma$/;
const figmaDefaultFilename = 'Untitled';
const importBatchSize = 100;
let token = '';

const enum ValidType {
  Slice = 'SLICE',
  Group = 'GROUP',
  Frame = 'FRAME',
  Component = 'COMPONENT',
}

const folders = new Map<ValidType, string>([
  [ValidType.Slice, 'slices'],
  [ValidType.Group, 'groups'],
  [ValidType.Component, 'groups'],
  [ValidType.Frame, 'frames'],
]);

export interface FigmaNode {
  exportSettings?: string[];
  name: string;
  type: ValidType;
  id: string;
  children: FigmaNode[];
  svg: string;
  svgURL: string;
}

export interface FigmaProject {
  name: string;
  lastModified: string;
  thumbnailURL: string;
  version: string;
  document: FigmaNode;
}

export interface FigmaImageResponse {
  err: null|string;
  images: FigmaImagesURL;
}

export interface FigmaImagesURL {
  [key: string]: string;
}

/**
 * Fetches SVG contents form the Figma API for a given set of FigmaNode elements.
 * @param elements elements to fetch SVG contents from the API
 */
const getSVGContents = (elements: FigmaNode[], outFolder: string) => {
  return Promise.all(
    elements.map(async (element) => {
      try {
        if (element.svgURL) {
          await downloadFile(
            element.svgURL,
            join(
              outFolder,
              (folders.get(element.type) || folders.get(ValidType.Slice))!,
              sanitizeFileName(`${element.name}.svg`),
            ),
          );
        }
      } catch (error) {
        throw new Error(`Error importing ${element.name}: ${error}`);
      }
    }),
  );
};

/**
 * Maps an array of elements into an array of elements with links to their
 * SVG representation in the cloud via the Figma API
 *
 * @param elements elements to get the SVG links from
 * @param id ID of the Figma file
 */
export const getSVGLinks = async (elements: FigmaNode[], id: string, authToken: string) => {
  const ids = chunk(elements.map((element) => element.id), importBatchSize);

  if (ids[0].length === 0) {
    throw new Error(
      'It looks like the Figma document you imported doesn\'t have any exportable elements. ' +
        'Try adding some and re-syncing.',
    );
  }

  const chunkedResponse = await Promise.all(ids.map(async (idsChunk) => {
    const params = new URLSearchParams([
      ['format', 'svg'],
      ['ids', idsChunk.join(',')],
      ['svg_include_id', 'true'],
    ]);

    const {images} = await performGetRequestWithBearerToken<FigmaImageResponse>(
      `${apiBase}images/${id}?${params.toString()}`,
      token,
    );

    return images;
  }));

  const imageResponse: FigmaImagesURL = Object.assign({}, ...chunkedResponse);

  return elements.map((element) => {
    return Object.assign(element, {svgURL: imageResponse[element.id]}) as FigmaNode;
  });
};

/**
 * Parses a Figma URL and returns an object describing the project, if the URL is invalid or can't be parsed
 * returns `null`.
 * @param rawURL a Figma project URL
 */
const parseProjectURL = (rawURL: string) => {
  const parsedURL = parse(rawURL);

  if (parsedURL && parsedURL.pathname && parsedURL.host && parsedURL.host.endsWith(figmaHost)) {
    const paths = parsedURL.pathname.split('/');
    return {id: paths[2] || '', name: paths[3] || figmaDefaultFilename};
  }

  return null;
};

/**
 * Fetch document info from the Figma API
 *
 * @param id ID of the Figma document
 */
const fetchFile = (id: string, authToken: string): Promise<FigmaProject> => {
  return performGetRequestWithBearerToken<FigmaProject>(`${apiBase}files/${id}`, authToken);
};

/**
 *  Find nodes that contain any of the types defined in `VALID_TYPES`
 *
 * @param iter a iterable that retrieves `FigmaNode`s
 * @param docId id of the Figma document
 * @param nameResolver helper to determine unique names
 */
const findExportableNodes = (iter: FigmaNode[], docId: string, nameResolver: UniqueNameResolver): FigmaNode[] => {
  const result: FigmaNode[] = [];

  for (const item of iter) {
    if (folders.has(item.type) || (item.exportSettings && item.exportSettings.length > 0)) {
      result.push({
        ...item,
        id: item.id,
        name: nameResolver.get(item.name),
        type: item.type,
      });
    }

    if (item.children) {
      result.push(...findExportableNodes(item.children, docId, nameResolver));
    }
  }

  return result;
};

export const figma: Exportable & OAutheable = {
  /**
   * Exports SVG contents from the given `source` into the `out` folder.
   *
   * @param source from where to extract the SVG
   * @param out directory to put the SVG
   */
  async exportSVG (source: string, out: string, onProgress: ProgressReporter = console.log) {
    if (!await this.canParse(source)) {
      throw new Error('Invalid source file.');
    }

    const projectData = parseProjectURL(source);

    if (!projectData) {
      throw new Error('Error parsing data from the provided URL. Please make sure it is a valid Figma project URL.');
    }

    if (!this.token) {
      throw new Error(
        'Figma requires a token in order to perform the export. Please set one (`figma.token = token`) and try again',
      );
    }

    onProgress('Fetching information from Figma.');
    const file = await fetchFile(projectData.id, this.token);
    await createFolders(out, folders);
    const elements = await findExportableNodes(file.document.children, projectData.id, new UniqueNameResolver());
    onProgress('Fetching SVG elements from Figma.');
    const elementsWithLinks = await getSVGLinks(elements, projectData.id, this.token);
    onProgress('Downloading SVG elements.');
    await getSVGContents(elementsWithLinks, out);
  },

  /**
   * Returns a boolean indicating if the source provided looks like a Figma file or a project URL.
   */
  async canParse (source: string) {
    return Boolean((source && source.match(isFigmaFileRegExp)) || parseProjectURL(source));
  },

  get token () {
    return token;
  },

  set token (newToken: string) {
    token = newToken;
  },
};
