# Diez &middot; [![Build Status](https://travis-ci.com/diez/diez.svg?token=YuETDnVqzQjQytETzD8J&branch=master)](https://travis-ci.com/diez/diez) [![codecov](https://codecov.io/gh/diez/diez/branch/master/graph/badge.svg?token=pgB9U8YLUU)](https://codecov.io/gh/diez/diez)

Diez is an open-source framework for creating design languages.

Diez allows you to maintain a centralized source of truth for your visual identity (a.k.a. your brand)—in a way that seamlessly integrates with any native iOS, Android, or Web codebase.

Update once, update everywhere—while embracing native platforms.  Diez radically reduces the cost of delivering a consistent look & feel across your company’s apps & websites.


### What's in the box?

 * **Design Language [Framework](https://github.com/diez/diez/tree/master/src/framework)**: Express platform-agnostic design languages in TypeScript, including helpers ("prefabs") for common building-blocks like colors, typography, images, shadows, and more.
 * **Cross-platform [Compiler](https://github.com/diez/diez/tree/master/src/compiler)**:  Build your design language into pure-native SDKs for iOS, Android, and the Web.  Supports Swift, Objective-C, Kotlin, Java, TypeScript, JavaScript, and CSS/SASS.

   These compiled packages are statically typed, self-documenting, and ready for any new or existing codebase. Distribution & versioning are supported with Carthage & Cocoapods on iOS, Gradle on Android, and npm+yarn on web.
 * **Design file [Extractors](https://github.com/diez/diez/tree/master/src/extractors)**: Extract image assets and strongly typed style definitions (colors, typography, and more) from Sketch, Figma, and InVision DSM.  The output of Extractors is Diez-ready TypeScript, ready to compile to native code.

   Treat design files as versionable code artifacts and automate your design-to-development workflow.
 * **Diez [CLI](https://github.com/diez/diez/tree/master/src/cli)**: Generate, configure, and manage Diez projects.

You can find all of the packages in the repo here. Feel free to take a look around!

## Getting Started

Please refer to [diez.org/getting-started](https://diez.org/getting-started) for installation instructions and a thorough set of getting started guides.

## Target Platform Support

Diez can be extended to support any language, platform, or development environment. The [native bindings](https://diez.org/glossary/#bindings) included with Diez support the following targets:

### iOS

The minimum deployment target for a generated iOS SDK is iOS 11.

### Android

The SDK generated by the provided Android implementation has been tested against Android Q (10).

### Web

In the provided web target implementation, we support CSS, Sass, and vanilla JS. Browser and build tooling support is very broad, and Diez web SDKs work in any modern web browser.

## Questions, guides, FAQ

Join our [Slack Community](https://join.slack.com/t/dieznative/shared_invite/enQtNzEzNzM2OTg4NDA1LTA4NWZiMTNlZTgzNTY3Yzg2ODdjY2Y1MzBjMjdlY2FlNjljMmI3ZTgzMmQ4ODk1MDdlMTcyMTUzMjNmZWI4YjU) and [Spectrum Community](https://spectrum.chat/diez) to open a direct line to our team. Feel free also to file a GitHub issue if you encounter any bugs or problems.

Also check out the website: [diez.org](https://diez.org/).


## Universal commands

The following commands are available in all subpackages, as well as in the monorepo itself. Running these commands in the monorepo will run across all subpackages.

 * `yarn compile` - compile all TypeScript to JS.
 * `yarn watch` - compile, then watch for changes.
 * `yarn lint` - lint TypeScript sources.
 * `yarn fix` - lint and automatically fix any automatically fixable lint issues found.
 * `yarn test` - run unit/integration tests.
 * `yarn health` - run tests and lint code with machine-readable outputs for CI.


## Licensing

Diez is published under a dual-license model in two editions:  *Community Edition* and *Enterprise Edition*.  This repository represents Community Edition and is [licensed accordingly.](https://github.com/diez/diez/blob/master/LICENSE.md)

Learn more about Diez licensing [here](https://diez.org/licensing/).

## Diez Enterprise Edition

Diez Enterprise Edition includes the Diez DocsGen add-on — an additional compiler target that allows you to build any Diez project into up-to-the-moment design language docs.  Customizable, searchable, self-hostable. Perfect for enterprise design systems.

![Gif showcasing DocsGen add-on](https://user-images.githubusercontent.com/4419992/68873716-a84a7f80-06c5-11ea-8519-4f9f2304cdd3.gif)

Diez EE also comes with flexible commercial licensing if the [Community Edition license](https://diez.org/licensing/) doesn't meet your needs, plus availability for integration, training, and support from the Diez team.

[Learn more about Diez EE.](https://diez.org/#enterprise-grade)
