import type { OutgoingHttpHeaders } from 'node:http';
import type { RemotePattern } from '@astrojs/internal-helpers/remote';
import type {
	RehypePlugins,
	RemarkPlugins,
	RemarkRehype,
	ShikiConfig,
	SyntaxHighlightConfigType,
} from '@astrojs/markdown-remark';
import type { BuiltinDriverName, BuiltinDriverOptions, Driver, Storage } from 'unstorage';
import type { UserConfig as OriginalViteUserConfig, SSROptions as ViteSSROptions } from 'vite';
import type { AstroFontProvider, FontFamily } from '../../assets/fonts/types.js';
import type { ImageFit, ImageLayout } from '../../assets/types.js';
import type { AssetsPrefix } from '../../core/app/types.js';
import type { AstroConfigType } from '../../core/config/schemas/index.js';
import type { REDIRECT_STATUS_CODES } from '../../core/constants.js';
import type { AstroCookieSetOptions } from '../../core/cookies/cookies.js';
import type { CspAlgorithm, CspDirective, CspHash } from '../../core/csp/config.js';
import type { Logger, LoggerLevel } from '../../core/logger/core.js';
import type { EnvSchema } from '../../env/schema.js';
import type { AstroIntegration } from './integrations.js';

export type Locales = (string | { codes: [string, ...string[]]; path: string })[];

export type { AstroFontProvider as FontProvider };

export type { CspAlgorithm };

type NormalizeLocales<T extends Locales> = {
	[K in keyof T]: T[K] extends string
		? T[K]
		: T[K] extends { codes: Array<string> }
			? T[K]['codes'][number]
			: never;
}[number];

export interface ImageServiceConfig<T extends Record<string, any> = Record<string, any>> {
	entrypoint: 'astro/assets/services/sharp' | (string & {});
	config?: T;
}

export type RuntimeMode = 'development' | 'production';

export type ValidRedirectStatus = (typeof REDIRECT_STATUS_CODES)[number];

export type RedirectConfig =
	| string
	| {
			status: ValidRedirectStatus;
			destination: string;
	  };

export type ServerConfig = {
	/**
	 * @name server.host
	 * @type {string | boolean}
	 * @default `false`
	 * @version 0.24.0
	 * @description
	 * Set which network IP addresses the dev server should listen on (i.e. 	non-localhost IPs).
	 * - `false` - do not expose on a network IP address
	 * - `true` - listen on all addresses, including LAN and public addresses
	 * - `[custom-address]` - expose on a network IP address at `[custom-address]`
	 */
	host?: string | boolean;

	/**
	 * @name server.port
	 * @type {number}
	 * @default `4321`
	 * @description
	 * Set which port the dev server should listen on.
	 *
	 * If the given port is already in use, Astro will automatically try the next available port.
	 */
	port?: number;

	/**
	 * @name server.allowedHosts
	 * @type {string[] | true}
	 * @default `[]`
	 * @version 5.4.0
	 * @description
	 *
	 * A list of hostnames that Astro is allowed to respond to. When the value is set to `true`, any
	 * hostname is allowed.
	 *
	 * ```js
	 * {
	 *   server: {
	 *   	allowedHosts: ['staging.example.com', 'qa.example.com']
	 *   }
	 * }
	 * ```
	 */
	allowedHosts?: string[] | true;

	/**
	 * @name server.headers
	 * @typeraw {OutgoingHttpHeaders}
	 * @default `{}`
	 * @version 1.7.0
	 * @description
	 * Set custom HTTP response headers to be sent in `astro dev` and `astro preview`.
	 */
	headers?: OutgoingHttpHeaders;

	/**
	 * @name server.open
	 * @type {string | boolean}
	 * @default `false`
	 * @version 4.1.0
	 * @description
	 * Controls whether the dev server should open in your browser window on startup.
	 *
	 * Pass a full URL string (e.g. "http://example.com") or a pathname (e.g. "/about") to specify the URL to open.
	 *
	 * ```js
	 * {
	 *   server: { open: "/about" }
	 * }
	 * ```
	 */
	open?: string | boolean;
};

export type SessionDriverName = BuiltinDriverName | 'custom' | 'test';

interface CommonSessionConfig {
	/**
	 * Configures the session cookie. If set to a string, it will be used as the cookie name.
	 * Alternatively, you can pass an object with additional options.
	 */
	cookie?:
		| string
		| (Omit<AstroCookieSetOptions, 'httpOnly' | 'expires' | 'encode'> & {
				name?: string;
		  });

	/**
	 * Default session duration in seconds. If not set, the session will be stored until deleted, or until the cookie expires.
	 */
	ttl?: number;
}

interface BuiltinSessionConfig<TDriver extends keyof BuiltinDriverOptions>
	extends CommonSessionConfig {
	driver: TDriver;
	options?: BuiltinDriverOptions[TDriver];
}

interface CustomSessionConfig extends CommonSessionConfig {
	/** Entrypoint for a custom session driver */
	driver?: string;
	options?: Record<string, unknown>;
}

interface TestSessionConfig extends CommonSessionConfig {
	driver: 'test';
	options: {
		mockStorage: Storage;
	};
}

export type SessionConfig<TDriver extends SessionDriverName> =
	TDriver extends keyof BuiltinDriverOptions
		? BuiltinSessionConfig<TDriver>
		: TDriver extends 'test'
			? TestSessionConfig
			: CustomSessionConfig;

export type ResolvedSessionConfig<TDriver extends SessionDriverName> = SessionConfig<TDriver> & {
	driverModule?: () => Promise<{ default: () => Driver }>;
};

export interface ViteUserConfig extends OriginalViteUserConfig {
	ssr?: ViteSSROptions;
}

// NOTE(fks): We choose to keep our hand-generated AstroUserConfig interface so that
// we can add JSDoc-style documentation and link to the definition file in our repo.
// However, Zod comes with the ability to auto-generate AstroConfig from the schema
// above. If we ever get to the point where we no longer need the dedicated type,
// consider replacing it with the following lines:
// export interface AstroUserConfig extends z.input<typeof AstroConfigSchema> {
// }

/**
 * Astro User Config
 * Docs: https://docs.astro.build/reference/configuration-reference/
 *
 * Generics do not follow semver and may change at any time.
 */ export interface AstroUserConfig<
	TLocales extends Locales = never,
	TSession extends SessionDriverName = never,
	TFontFamilies extends FontFamily[] = never,
> {
	/**
	 * @docs
	 * @kind heading
	 * @name Top-Level Options
	 */

	/**
	 * @docs
	 * @name site
	 * @type {string}
	 * @description
	 * Your final, deployed URL. Astro uses this full URL to generate your sitemap and canonical URLs in your final build. It is strongly recommended that you set this configuration to get the most out of Astro.
	 *
	 * ```js
	 * {
	 *   site: 'https://www.my-site.dev'
	 * }
	 * ```
	 */
	site?: string;

	/**
	 * @docs
	 * @name base
	 * @type {string}
	 * @description
	 * The base path to deploy to. Astro will use this path as the root for your pages and assets both in development and in production build.
	 *
	 * In the example below, `astro dev` will start your server at `/docs`.
	 *
	 * ```js
	 * {
	 *   base: '/docs'
	 * }
	 * ```
	 *
	 * When using this option, all of your static asset imports and URLs should add the base as a prefix. You can access this value via `import.meta.env.BASE_URL`.
	 *
	 * The value of `import.meta.env.BASE_URL` will be determined by your `trailingSlash` config, no matter what value you have set for `base`.
	 *
	 * A trailing slash is always included if `trailingSlash: "always"` is set. If `trailingSlash: "never"` is set, `BASE_URL` will not include a trailing slash, even if `base` includes one.
	 *
	 * Additionally, Astro will internally manipulate the configured value of `config.base` before making it available to integrations. The value of `config.base` as read by integrations will also be determined by your `trailingSlash` configuration in the same way.
	 *
	 * In the example below, the values of `import.meta.env.BASE_URL` and `config.base` when processed will both be `/docs`:
	 * ```js
	 * {
	 * 	 base: '/docs/',
	 * 	 trailingSlash: "never"
	 * }
	 * ```
	 *
	 * In the example below, the values of `import.meta.env.BASE_URL` and `config.base` when processed will both be `/docs/`:
	 *
	 * ```js
	 * {
	 * 	 base: '/docs',
	 * 	 trailingSlash: "always"
	 * }
	 * ```
	 */
	base?: string;

	/**
	 * @docs
	 * @name trailingSlash
	 * @type {('always' | 'never' | 'ignore')}
	 * @default `'ignore'`
	 * @see build.format
	 * @description
	 *
	 * Set the route matching behavior for trailing slashes in the dev server and on-demand rendered pages. Choose from the following options:
	 *   - `'ignore'` - Match URLs regardless of whether a trailing "/" exists. Requests for "/about" and "/about/" will both match the same route.
	 *   - `'always'` - Only match URLs that include a trailing slash (e.g: "/about/"). In production, requests for on-demand rendered URLs without a trailing slash will be redirected to the correct URL for your convenience. However, in development, they will display a warning page reminding you that you have `always` configured.
	 *   - `'never'` - Only match URLs that do not include a trailing slash (e.g: "/about"). In production, requests for on-demand rendered URLs with a trailing slash will be redirected to the correct URL for your convenience. However, in development, they will display a warning page reminding you that you have `never` configured.
	 *
	 * When redirects occur in production for GET requests, the redirect will be a 301 (permanent) redirect. For all other request methods, it will be a 308 (permanent, and preserve the request method) redirect.
	 *
	 * Trailing slashes on prerendered pages are handled by the hosting platform, and may not respect your chosen configuration.
	 * See your hosting platform's documentation for more information. You cannot use Astro [redirects](#redirects) for this use case at this point.
	 *
	 * ```js
	 * {
	 *   // Example: Require a trailing slash during development
	 *   trailingSlash: 'always'
	 * }
	 * ```
	 */
	trailingSlash?: 'always' | 'never' | 'ignore';

	/**
	 * @docs
	 * @name redirects
	 * @type {Record<string, RedirectConfig>}
	 * @default `{}`
	 * @version 2.9.0
	 * @description Specify a mapping of redirects where the key is the route to match
	 * and the value is the path to redirect to.
	 *
	 * You can redirect both static and dynamic routes, but only to the same kind of route.
	 * For example, you cannot have a `'/article': '/blog/[...slug]'` redirect.
	 *
	 *
	 * ```js
	 * export default defineConfig({
	 *   redirects: {
	 *    '/old': '/new',
	 *    '/blog/[...slug]': '/articles/[...slug]',
	 *    '/about': 'https://example.com/about',
	 *    '/news': {
	 *      status: 302,
	 *      destination: 'https://example.com/news'
	 *    },
	 *    // '/product1/', '/product1' // Note, this is not supported
	 * 	}
	 * })
	 * ```
	 *
	 *
	 * For statically-generated sites with no adapter installed, this will produce a client redirect using a [`<meta http-equiv="refresh">` tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#http-equiv) and does not support status codes.
	 *
	 * When using SSR or with a static adapter in `output: static`
	 * mode, status codes are supported.
	 * Astro will serve redirected GET requests with a status of `301`
	 * and use a status of `308` for any other request method.
	 *
	 * You can customize the [redirection status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages) using an object in the redirect config:
	 *
	 * ```js
	 * export default defineConfig({
	 *   redirects: {
	 *     '/other': {
	 *       status: 302,
	 *       destination: '/place',
	 *     },
	 *   }
	 * })
	 *
	 *
	 * ```
	 */
	redirects?: Record<string, RedirectConfig>;

	/**
	 * @docs
	 * @name output
	 * @type {('static' | 'server')}
	 * @default `'static'`
	 * @see adapter
	 * @description
	 *
	 * Specifies the output target for builds.
	 *
	 * - `'static'` - Prerender all your pages by default, outputting a completely static site if none of your pages opt out of prerendering.
	 * - `'server'` - Use server-side rendering (SSR) for all pages by default, always outputting a server-rendered site.
	 *
	 * ```js
	 * import { defineConfig } from 'astro/config';
	 *
	 * export default defineConfig({
	 *   output: 'static'
	 * })
	 * ```
	 */
	output?: 'static' | 'server';

	/**
	 * @docs
	 * @name adapter
	 * @typeraw {AstroIntegration}
	 * @see output
	 * @description
	 *
	 * Deploy to your favorite server, serverless, or edge host with build adapters. Import one of our first-party adapters ([Cloudflare](/en/guides/integrations-guide/cloudflare/), [Netlify](/en/guides/integrations-guide/netlify/), [Node.js](/en/guides/integrations-guide/node/), [Vercel](/en/guides/integrations-guide/vercel/)) or explore [community adapters](https://astro.build/integrations/2/?search=&categories%5B%5D=adapters) to enable on-demand rendering in your Astro project.
	 *
	 * See our [on-demand rendering guide](/en/guides/on-demand-rendering/) for more on Astro's server rendering options.
	 *
	 * ```js
	 * import netlify from '@astrojs/netlify';
	 * {
	 *   // Example: Build for Netlify serverless deployment
	 *   adapter: netlify(),
	 * }
	 * ```
	 */
	adapter?: AstroIntegration;

	/**
	 * @docs
	 * @name integrations
	 * @typeraw {AstroIntegration[]}
	 * @description
	 *
	 * Extend Astro with custom integrations. Integrations are your one-stop-shop for adding framework support (like Solid.js), new features (like sitemaps), and new libraries (like Partytown).
	 *
	 * Read our [Integrations Guide](https://docs.astro.build/en/guides/integrations-guide/) for help getting started with Astro Integrations.
	 *
	 * ```js
	 * import react from '@astrojs/react';
	 * import mdx from '@astrojs/mdx';
	 * {
	 *   // Example: Add React + MDX support to Astro
	 *   integrations: [react(), mdx()]
	 * }
	 * ```
	 */
	integrations?: Array<
		AstroIntegration | (AstroIntegration | false | undefined | null)[] | false | undefined | null
	>;

	/**
	 * @docs
	 * @name root
	 * @cli --root
	 * @type {string}
	 * @default `"."` (current working directory)
	 * @summary Set the project root. The project root is the directory where your Astro project (and all `src`, `public` and `package.json` files) live.
	 * @description  You should only provide this option if you run the `astro` CLI commands in a directory other than the project root directory. Usually, this option is provided via the CLI instead of the Astro config file, since Astro needs to know your project root before it can locate your config file.
	 *
	 * If you provide a relative path (ex: `--root: './my-project'`) Astro will resolve it against your current working directory.
	 *
	 * #### Examples
	 *
	 * ```js
	 * {
	 *   root: './my-project-directory'
	 * }
	 * ```
	 * ```bash
	 * $ astro build --root ./my-project-directory
	 * ```
	 */
	root?: string;

	/**
	 * @docs
	 * @name srcDir
	 * @type {string}
	 * @default `"./src"`
	 * @description Set the directory that Astro will read your site from.
	 *
	 * The value can be either an absolute file system path or a path relative to the project root.
	 *
	 * ```js
	 * {
	 *   srcDir: './www'
	 * }
	 * ```
	 */
	srcDir?: string;

	/**
	 * @docs
	 * @name publicDir
	 * @type {string}
	 * @default `"./public"`
	 * @description
	 * Set the directory for your static assets. Files in this directory are served at `/` during dev and copied to your build directory during build. These files are always served or copied as-is, without transform or bundling.
	 *
	 * The value can be either an absolute file system path or a path relative to the project root.
	 *
	 * ```js
	 * {
	 *   publicDir: './my-custom-publicDir-directory'
	 * }
	 * ```
	 */
	publicDir?: string;

	/**
	 * @docs
	 * @name outDir
	 * @type {string}
	 * @default `"./dist"`
	 * @see build.server
	 * @description Set the directory that `astro build` writes your final build to.
	 *
	 * The value can be either an absolute file system path or a path relative to the project root.
	 *
	 * ```js
	 * {
	 *   outDir: './my-custom-build-directory'
	 * }
	 * ```
	 */
	outDir?: string;

	/**
	 * @docs
	 * @name cacheDir
	 * @type {string}
	 * @default `"./node_modules/.astro"`
	 * @description Set the directory for caching build artifacts. Files in this directory will be used in subsequent builds to speed up the build time.
	 *
	 * The value can be either an absolute file system path or a path relative to the project root.
	 *
	 * ```js
	 * {
	 *   cacheDir: './my-custom-cache-directory'
	 * }
	 * ```
	 */
	cacheDir?: string;

	/**
	 * @docs
	 * @name compressHTML
	 * @type {boolean}
	 * @default `true`
	 * @description
	 *
	 * This is an option to minify your HTML output and reduce the size of your HTML files.
	 *
	 * By default, Astro removes whitespace from your HTML, including line breaks, from `.astro` components in a lossless manner.
	 * Some whitespace may be kept as needed to preserve the visual rendering of your HTML. This occurs both in development mode and in the final build.
	 *
	 * To disable HTML compression, set `compressHTML` to false.
	 *
	 * ```js
	 * {
	 *   compressHTML: false
	 * }
	 * ```
	 */
	compressHTML?: boolean;

	/**
	 * @docs
	 * @name scopedStyleStrategy
	 * @type {('where' | 'class' | 'attribute')}
	 * @default `'attribute'`
	 * @version 2.4
	 * @description
	 *
	 * Specify the strategy used for scoping styles within Astro components. Choose from:
	 *   - `'where'` 		- Use `:where` selectors, causing no specificity increase.
	 *   - `'class'` 		- Use class-based selectors, causing a +1 specificity increase.
	 *   - `'attribute'` 	- Use `data-` attributes, causing a +1 specificity increase.
	 *
	 * Using `'class'` is helpful when you want to ensure that element selectors within an Astro component override global style defaults (e.g. from a global stylesheet).
	 * Using `'where'` gives you more control over specificity, but requires that you use higher-specificity selectors, layers, and other tools to control which selectors are applied.
	 * Using `'attribute'` is useful when you are manipulating the `class` attribute of elements and need to avoid conflicts between your own styling logic and Astro's application of styles.
	 */
	scopedStyleStrategy?: 'where' | 'class' | 'attribute';

	/**
	 * @docs
	 * @name security
	 * @type {Record<"checkOrigin", boolean> | undefined}
	 * @default `{checkOrigin: true}`
	 * @version 4.9.0
	 * @description
	 *
	 * Enables security measures for an Astro website.
	 *
	 * These features only exist for pages rendered on demand (SSR) using `server` mode or pages that opt out of prerendering in `static` mode.
	 *
	 * By default, Astro will automatically check that the “origin” header
	 * matches the URL sent by each request in on-demand rendered pages. You can
	 * disable this behavior by setting `checkOrigin` to `false`:
	 *
	 * ```js
	 * // astro.config.mjs
	 * export default defineConfig({
	 *   output: "server",
	 *   security: {
	 *     checkOrigin: false
	 *   }
	 * })
	 * ```
	 */
	security?: {
		/**
		 * @docs
		 * @name security.checkOrigin
		 * @kind h4
		 * @type {boolean}
		 * @default `true`
		 * @version 4.9.0
		 * @description
		 *
		 * Performs a check that the "origin" header, automatically passed by all modern browsers, matches the URL sent by each `Request`. This is used to provide Cross-Site Request Forgery (CSRF) protection.
		 *
		 * The "origin" check is executed only for pages rendered on demand, and only for the requests `POST`, `PATCH`, `DELETE` and `PUT` with
		 * one of the following `content-type` headers: `'application/x-www-form-urlencoded'`, `'multipart/form-data'`, `'text/plain'`.
		 *
		 * If the "origin" header doesn't match the `pathname` of the request, Astro will return a 403 status code and will not render the page.
		 */

		checkOrigin?: boolean;
	};

	/**
	 * @docs
	 * @name vite
	 * @typeraw {ViteUserConfig}
	 * @description
	 *
	 * Pass additional configuration options to Vite. Useful when Astro doesn't support some advanced configuration that you may need.
	 *
	 * View the full `vite` configuration object documentation on [vite.dev](https://vite.dev/config/).
	 *
	 * #### Examples
	 *
	 * ```js
	 * {
	 *   vite: {
	 *     ssr: {
	 *       // Example: Force a broken package to skip SSR processing, if needed
	 *       external: ['broken-npm-package'],
	 *     }
	 *   }
	 * }
	 * ```
	 *
	 * ```js
	 * {
	 *   vite: {
	 *     // Example: Add custom vite plugins directly to your Astro project
	 *     plugins: [myPlugin()],
	 *   }
	 * }
	 * ```
	 */
	vite?: ViteUserConfig;

	/**
	 * @docs
	 * @kind heading
	 * @name Build Options
	 */
	build?: {
		/**
		 * @docs
		 * @name build.format
		 * @typeraw {('file' | 'directory' | 'preserve')}
		 * @default `'directory'`
		 * @description
		 * Control the output file format of each page. This value may be set by an adapter for you.
		 *   - `'file'`: Astro will generate an HTML file named for each page route. (e.g. `src/pages/about.astro` and `src/pages/about/index.astro` both build the file `/about.html`)
		 *   - `'directory'`: Astro will generate a directory with a nested `index.html` file for each page. (e.g. `src/pages/about.astro` and `src/pages/about/index.astro` both build the file `/about/index.html`)
		 *   - `'preserve'`: Astro will generate HTML files exactly as they appear in your source folder. (e.g. `src/pages/about.astro` builds `/about.html` and `src/pages/about/index.astro` builds the file `/about/index.html`)
		 *
		 * ```js
		 * {
		 *   build: {
		 *     // Example: Generate `page.html` instead of `page/index.html` during build.
		 *     format: 'file'
		 *   }
		 * }
		 * ```
		 *
		 *
		 *
		 * #### Effect on Astro.url
		 * Setting `build.format` controls what `Astro.url` is set to during the build. When it is:
		 * - `directory` - The `Astro.url.pathname` will include a trailing slash to mimic folder behavior. (e.g. `/foo/`)
		 * - `file` - The `Astro.url.pathname` will include `.html`. (e.g. `/foo.html`)
		 *
		 * This means that when you create relative URLs using `new URL('./relative', Astro.url)`, you will get consistent behavior between dev and build.
		 *
		 * To prevent inconsistencies with trailing slash behaviour in dev, you can restrict the [`trailingSlash` option](#trailingslash) to `'always'` or `'never'` depending on your build format:
		 * - `directory` - Set `trailingSlash: 'always'`
		 * - `file` - Set `trailingSlash: 'never'`
		 */
		format?: 'file' | 'directory' | 'preserve';
		/**
		 * @docs
		 * @name build.client
		 * @type {string}
		 * @default `'./client'`
		 * @description
		 * Controls the output directory of your client-side CSS and JavaScript when building a website with server-rendered pages.
		 * `outDir` controls where the code is built to.
		 *
		 * This value is relative to the `outDir`.
		 *
		 * ```js
		 * {
		 *   output: 'server',
		 *   build: {
		 *     client: './client'
		 *   }
		 * }
		 * ```
		 */
		client?: string;
		/**
		 * @docs
		 * @name build.server
		 * @type {string}
		 * @default `'./server'`
		 * @description
		 * Controls the output directory of server JavaScript when building to SSR.
		 *
		 * This value is relative to the `outDir`.
		 *
		 * ```js
		 * {
		 *   build: {
		 *     server: './server'
		 *   }
		 * }
		 * ```
		 */
		server?: string;
		/**
		 * @docs
		 * @name build.assets
		 * @type {string}
		 * @default `'_astro'`
		 * @see outDir
		 * @version 2.0.0
		 * @description
		 * Specifies the directory in the build output where Astro-generated assets (bundled JS and CSS for example) should live.
		 *
		 * ```js
		 * {
		 *   build: {
		 *     assets: '_custom'
		 *   }
		 * }
		 * ```
		 */
		assets?: string;
		/**
		 * @docs
		 * @name build.assetsPrefix
		 * @type {string | Record<string, string>}
		 * @default `undefined`
		 * @version 2.2.0
		 * @description
		 * Specifies the prefix for Astro-generated asset links. This can be used if assets are served from a different domain than the current site.
		 *
		 * This requires uploading the assets in your local `./dist/_astro` folder to a corresponding `/_astro/` folder on the remote domain.
		 * To rename the `_astro` path, specify a new directory in `build.assets`.
		 *
		 * To fetch all assets uploaded to the same domain (e.g. `https://cdn.example.com/_astro/...`), set `assetsPrefix` to the root domain as a string (regardless of your `base` configuration):
		 *
		 * ```js
		 * {
		 *   build: {
		 *     assetsPrefix: 'https://cdn.example.com'
		 *   }
		 * }
		 * ```
		 *
		 * **Added in:** `astro@4.5.0`
		 *
		 * You can also pass an object to `assetsPrefix` to specify a different domain for each file type.
		 * In this case, a `fallback` property is required and will be used by default for any other files.
		 *
		 * ```js
		 * {
		 *   build: {
		 *     assetsPrefix: {
		 *       'js': 'https://js.cdn.example.com',
		 *       'mjs': 'https://js.cdn.example.com',
		 *       'css': 'https://css.cdn.example.com',
		 *       'fallback': 'https://cdn.example.com'
		 *     }
		 *   }
		 * }
		 * ```
		 *
		 */
		assetsPrefix?: AssetsPrefix;
		/**
		 * @docs
		 * @name build.serverEntry
		 * @type {string}
		 * @default `'entry.mjs'`
		 * @description
		 * Specifies the file name of the server entrypoint when building to SSR.
		 * This entrypoint is usually dependent on which host you are deploying to and
		 * will be set by your adapter for you.
		 *
		 * Note that it is recommended that this file ends with `.mjs` so that the runtime
		 * detects that the file is a JavaScript module.
		 *
		 * ```js
		 * {
		 *   build: {
		 *     serverEntry: 'main.mjs'
		 *   }
		 * }
		 * ```
		 */
		serverEntry?: string;
		/**
		 * @docs
		 * @name build.redirects
		 * @type {boolean}
		 * @default `true`
		 * @version 2.6.0
		 * @description
		 * Specifies whether redirects will be output to HTML during the build.
		 * This option only applies to `output: 'static'` mode; in SSR redirects
		 * are treated the same as all responses.
		 *
		 * This option is mostly meant to be used by adapters that have special
		 * configuration files for redirects and do not need/want HTML based redirects.
		 *
		 * ```js
		 * {
		 *   build: {
		 *     redirects: false
		 *   }
		 * }
		 * ```
		 */
		redirects?: boolean;
		/**
		 * @docs
		 * @name build.inlineStylesheets
		 * @type {('always' | 'auto' | 'never')}
		 * @default `auto`
		 * @version 2.6.0
		 * @description
		 * Control whether project styles are sent to the browser in a separate css file or inlined into `<style>` tags. Choose from the following options:
		 *  - `'always'` - project styles are inlined into `<style>` tags
		 *  - `'auto'` - only stylesheets smaller than `ViteConfig.build.assetsInlineLimit` (default: 4kb) are inlined. Otherwise, project styles are sent in external stylesheets.
		 *  - `'never'` - project styles are sent in external stylesheets
		 *
		 * ```js
		 * {
		 * 	build: {
		 *		inlineStylesheets: `never`,
		 * 	},
		 * }
		 * ```
		 */
		inlineStylesheets?: 'always' | 'auto' | 'never';
		/**
		 * @docs
		 * @name build.concurrency
		 * @type { number }
		 * @default `1`
		 * @version 4.16.0
		 * @description
		 * The number of pages to build in parallel.
		 *
		 * **In most cases, you should not change the default value of `1`.**
		 *
		 * Use this option only when other attempts to reduce the overall rendering time (e.g. batch or cache long running tasks like fetch calls or data access) are not possible or are insufficient.
		 * If the number is set too high, page rendering may slow down due to insufficient memory resources and because JS is single-threaded.
		 *
		 * ```js
		 * {
		 *   build: {
		 *     concurrency: 2
		 *   }
		 * }
		 * ```
		 *
		 *  :::caution[Breaking changes possible]
		 *  This feature is stable and is not considered experimental. However, this feature is only intended to address difficult performance issues, and breaking changes may occur in a [minor release](https://docs.astro.build/en/upgrade-astro/#semantic-versioning) to keep this option as performant as possible. Please check the [Astro CHANGELOG](https://github.com/withastro/astro/blob/refs/heads/next/packages/astro/CHANGELOG.md) for every minor release if you are using this feature.
		 *  :::
		 */
		concurrency?: number;
	};

	/**
	 * @docs
	 * @kind heading
	 * @name Server Options
	 * @description
	 *
	 * Customize the Astro dev server, used by both `astro dev` and `astro preview`.
	 *
	 * ```js
	 * {
	 *   server: { port: 1234, host: true}
	 * }
	 * ```
	 *
	 * To set different configuration based on the command run ("dev", "preview") a function can also be passed to this configuration option.
	 *
	 * ```js
	 * {
	 *   // Example: Use the function syntax to customize based on command
	 *   server: ({ command }) => ({ port: command === 'dev' ? 4321 : 4000 })
	 * }
	 * ```
	 */

	/**
	 * @docs
	 * @name server.host
	 * @type {string | boolean}
	 * @default `false`
	 * @version 0.24.0
	 * @description
	 * Set which network IP addresses the server should listen on (i.e. non-localhost IPs).
	 * - `false` - do not expose on a network IP address
	 * - `true` - listen on all addresses, including LAN and public addresses
	 * - `[custom-address]` - expose on a network IP address at `[custom-address]` (ex: `192.168.0.1`)
	 */

	/**
	 * @docs
	 * @name server.port
	 * @type {number}
	 * @default `4321`
	 * @description
	 * Set which port the server should listen on.
	 *
	 * If the given port is already in use, Astro will automatically try the next available port.
	 *
	 * ```js
	 * {
	 *   server: { port: 8080 }
	 * }
	 * ```
	 */

	/**
	 * @docs
	 * @name server.allowedHosts
	 * @type {string[] | true}
	 * @default `[]`
	 * @version 5.4.0
	 * @description
	 *
	 * A list of hostnames that Astro is allowed to respond to. When the value is set to `true`, any
	 * hostname is allowed.
	 *
	 * ```js
	 * {
	 *   server: {
	 *   	allowedHosts: ['staging.example.com', 'qa.example.com']
	 *   }
	 * }
	 * ```
	 */

	/**
	 * @docs
	 * @name server.open
	 * @type {string | boolean}
	 * @default `false`
	 * @version 4.1.0
	 * @description
	 * Controls whether the dev server should open in your browser window on startup.
	 *
	 * Pass a full URL string (e.g. "http://example.com") or a pathname (e.g. "/about") to specify the URL to open.
	 *
	 * ```js
	 * {
	 *   server: { open: "/about" }
	 * }
	 * ```
	 */

	/**
	 * @docs
	 * @name server.headers
	 * @typeraw {OutgoingHttpHeaders}
	 * @default `{}`
	 * @version 1.7.0
	 * @description
	 * Set custom HTTP response headers to be sent in `astro dev` and `astro preview`.
	 */

	server?: ServerConfig | ((options: { command: 'dev' | 'preview' }) => ServerConfig);

	/**
	 * @docs
	 * @kind heading
	 * @version 5.7.0
	 * @name Session Options
	 * @description
	 *
	 * Configures session storage for your Astro project. This is used to store session data in a persistent way, so that it can be accessed across different requests.
	 * Some adapters may provide a default session driver, but you can override it with your own configuration.
	 *
	 * See [the sessions guide](https://docs.astro.build/en/guides/sessions/) for more information.
	 *
	 * ```js title="astro.config.mjs"
	 *   {
	 *     session: {
	 *       // The name of the Unstorage driver
	 *       driver: 'redis',
	 *       // The required options depend on the driver
	 *       options: {
	 *         url: process.env.REDIS_URL,
	 *       },
	 *       ttl: 3600, // 1 hour
	 *     }
	 *   }
	 * ```
	 */
	session?: SessionConfig<TSession>;

	/**
	 * @docs
	 * @name session.driver
	 * @type {string | undefined}
	 * @version 5.7.0
	 * @description
	 *
	 * The Unstorage driver to use for session storage.  The [Node](https://docs.astro.build/en/guides/integrations-guide/node/#sessions),
	 * [Cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#sessions), and
	 * [Netlify](/en/guides/integrations-guide/netlify/#sessions) adapters automatically configure a default driver for you,
	 * but you can specify your own if you would prefer or if you are using an adapter that does not provide one.
	 *
	 * The value is the "Driver name" from the [Unstorage driver documentation](https://unstorage.unjs.io/drivers).
	 *
	 * ```js title="astro.config.mjs" ins={4}
	 * {
	 *   adapter: vercel(),
	 *   session: {
	 *     driver: "redis",
	 *   },
	 * }
	 * ```
	 * :::note
	 * Some drivers may need extra packages to be installed. Some drivers may also require environment variables or credentials to be set. See the [Unstorage documentation](https://unstorage.unjs.io/drivers) for more information.
	 * :::
	 *
	 */

	/**
	 * @docs
	 * @name session.options
	 * @type {Record<string, unknown> | undefined}
	 * @version 5.7.0
	 * @default `{}`
	 * @description
	 *
	 * The driver-specific options to use for session storage. The options depend on the driver you are using. See the [Unstorage documentation](https://unstorage.unjs.io/drivers)
	 * for more information on the options available for each driver.
	 *
	 * ```js title="astro.config.mjs" ins={4-6}
	 * {
	 *    session: {
	 *      driver: "redis",
	 *      options: {
	 *        url: process.env.REDIS_URL
	 *      },
	 *    }
	 * }
	 * ```
	 */

	/**
	 * @docs
	 * @name session.cookie
	 * @type {string | AstroCookieSetOptions | undefined}
	 * @version 5.7.0
	 * @default `{ name: "astro-session", sameSite: "lax", httpOnly: true, secure: true }`
	 * @description
	 *
	 * The session cookie configuration. If set to a string, it will be used as the cookie name.
	 * Alternatively, you can pass an object with additional options. These will be merged with the defaults.
	 *
	 * ```js title="astro.config.mjs" ins={3-4}
	 * {
	 *  session: {
	 *    // If set to a string, it will be used as the cookie name.
	 *    cookie: "my-session-cookie",
	 *  }
	 * }
	 *
	 * ```
	 *
	 * ```js title="astro.config.mjs" ins={4-8}
	 * {
	 *  session: {
	 *    // If set to an object, it will be used as the cookie options.
	 *    cookie: {
	 *      name: "my-session-cookie",
	 *      sameSite: "lax",
	 *      secure: true,
	 *    }
	 *  }
	 * }
	 * ```
	 */

	/**
	 * @docs
	 * @name session.ttl
	 * @version 5.7.0
	 * @type {number | undefined}
	 * @default {Infinity}
	 * @description
	 *
	 * An optional default time-to-live expiration period for session values, in seconds.
	 *
	 * By default, session values persist until they are deleted or the session is destroyed, and do not automatically expire because a particular amount of time has passed.
	 * Set `session.ttl` to add a default expiration period for your session values. Passing a `ttl` option to [`session.set()`](https://docs.astro.build/en/reference/api-reference/#set) will override the global default
	 * for that individual entry.
	 *
	 * ```js title="astro.config.mjs" ins={3-4}
	 * {
	 *  session: {
	 *    // Set a default expiration period of 1 hour (3600 seconds)
	 *    ttl: 3600,
	 *  }
	 * }
	 * ```
	 * :::note
	 * Setting a value for `ttl` does not automatically delete the value from storage after the time limit has passed.
	 *
	 * Values from storage will only be deleted when there is an attempt to access them after the `ttl` period has expired. At this time, the session value will be undefined and only then will the value be deleted.
	 *
	 * Individual drivers may also support a `ttl` option that will automatically delete sessions after the specified time. See your chosen driver's documentation for more information.
	 * :::
	 */

	/**
	 * @docs
	 * @kind heading
	 * @name Dev Toolbar Options
	 */
	devToolbar?: {
		/**
		 * @docs
		 * @name devToolbar.enabled
		 * @type {boolean}
		 * @default `true`
		 * @description
		 * Whether to enable the Astro Dev Toolbar. This toolbar allows you to inspect your page islands, see helpful audits on performance and accessibility, and more.
		 *
		 * This option is scoped to the entire project, to only disable the toolbar for yourself, run `npm run astro preferences disable devToolbar`. To disable the toolbar for all your Astro projects, run `npm run astro preferences disable devToolbar --global`.
		 */
		enabled: boolean;
	};

	/**
	 * @docs
	 * @kind heading
	 * @name Prefetch Options
	 * @type {boolean | object}
	 * @description
	 * Enable prefetching for links on your site to provide faster page transitions.
	 * (Enabled by default on pages using the `<ClientRouter />` router. Set `prefetch: false` to opt out of this behaviour.)
	 *
	 * This configuration automatically adds a prefetch script to every page in the project
	 * giving you access to the `data-astro-prefetch` attribute.
	 * Add this attribute to any `<a />` link on your page to enable prefetching for that page.
	 *
	 * ```html
	 * <a href="/about" data-astro-prefetch>About</a>
	 * ```
	 * Further customize the default prefetching behavior using the [`prefetch.defaultStrategy`](#prefetchdefaultstrategy) and [`prefetch.prefetchAll`](#prefetchprefetchall) options.
	 *
	 * See the [Prefetch guide](https://docs.astro.build/en/guides/prefetch/) for more information.
	 */
	prefetch?:
		| boolean
		| {
				/**
				 * @docs
				 * @name prefetch.prefetchAll
				 * @type {boolean}
				 * @description
				 * Enable prefetching for all links, including those without the `data-astro-prefetch` attribute.
				 * This value defaults to `true` when using the `<ClientRouter />` router. Otherwise, the default value is `false`.
				 *
				 * ```js
				 * prefetch: {
				 * 	prefetchAll: true
				 * }
				 * ```
				 *
				 * When set to `true`, you can disable prefetching individually by setting `data-astro-prefetch="false"` on any individual links.
				 *
				 * ```html
				 * <a href="/about" data-astro-prefetch="false">About</a>
				 *```
				 */
				prefetchAll?: boolean;

				/**
				 * @docs
				 * @name prefetch.defaultStrategy
				 * @type {'tap' | 'hover' | 'viewport' | 'load'}
				 * @default `'hover'`
				 * @description
				 * The default prefetch strategy to use when the `data-astro-prefetch` attribute is set on a link with no value.
				 *
				 * - `'tap'`: Prefetch just before you click on the link.
				 * - `'hover'`: Prefetch when you hover over or focus on the link. (default)
				 * - `'viewport'`: Prefetch as the links enter the viewport.
				 * - `'load'`: Prefetch all links on the page after the page is loaded.
				 *
				 * You can override this default value and select a different strategy for any individual link by setting a value on the attribute.
				 *
				 * ```html
				 * <a href="/about" data-astro-prefetch="viewport">About</a>
				 * ```
				 */
				defaultStrategy?: 'tap' | 'hover' | 'viewport' | 'load';
		  };

	/**
	 * @docs
	 * @kind heading
	 * @name Image Options
	 */
	image?: {
		/**
		 * @docs
		 * @name image.endpoint
		 * @type {{route: string, entrypoint: undefined | string}}
		 * @default `{route: '/_image', entrypoint: undefined}`
		 * @version 3.1.0
		 * @description
		 * Set the endpoint to use for image optimization in dev and SSR. The `entrypoint` property can be set to `undefined` to use the default image endpoint.
		 *
		 * ```js
		 * {
		 *   image: {
		 *     // Example: Use a custom image endpoint at `/custom_endpoint`
		 *     endpoint: {
		 * 		 	route: '/custom_endpoint',
		 * 		 	entrypoint: 'src/my_endpoint.ts',
		 * 		},
		 *   },
		 * }
		 * ```
		 */
		endpoint?: {
			route: '/_image' | (string & {});
			entrypoint: undefined | string;
		};

		/**
		 * @docs
		 * @name image.service
		 * @type {{entrypoint: 'astro/assets/services/sharp' | string, config: Record<string, any>}}
		 * @default `{entrypoint: 'astro/assets/services/sharp', config?: {}}`
		 * @version 2.1.0
		 * @description
		 * Set which image service is used for Astro’s assets support.
		 *
		 * The value should be an object with an entrypoint for the image service to use and optionally, a config object to pass to the service.
		 *
		 * The service entrypoint can be either one of the included services, or a third-party package.
		 *
		 * ```js
		 * {
		 *   image: {
		 *     // Example: Enable the Sharp-based image service with a custom config
		 *     service: {
		 * 			 entrypoint: 'astro/assets/services/sharp',
		 * 			 config: {
		 * 				 limitInputPixels: false,
		 *       },
		 * 		 },
		 *   },
		 * }
		 * ```
		 */
		service?: ImageServiceConfig;
		/**
		 * @docs
		 * @name image.service.config.limitInputPixels
		 * @kind h4
		 * @type {number | boolean}
		 * @default `true`
		 * @version 4.1.0
		 * @description
		 *
		 * Whether or not to limit the size of images that the Sharp image service will process.
		 *
		 * Set `false` to bypass the default image size limit for the Sharp image service and process large images.
		 */

		/**
		 * @docs
		 * @name image.domains
		 * @type {string[]}
		 * @default `[]`
		 * @version 2.10.10
		 * @description
		 * Defines a list of permitted image source domains for remote image optimization. No other remote images will be optimized by Astro.
		 *
		 * This option requires an array of individual domain names as strings. Wildcards are not permitted. Instead, use [`image.remotePatterns`](#imageremotepatterns) to define a list of allowed source URL patterns.
		 *
		 * ```js
		 * // astro.config.mjs
		 * {
		 *   image: {
		 *     // Example: Allow remote image optimization from a single domain
		 *     domains: ['astro.build'],
		 *   },
		 * }
		 * ```
		 */
		domains?: string[];

		/**
		 * @docs
		 * @name image.remotePatterns
		 * @type {RemotePattern[]}
		 * @default `[]`
		 * @version 2.10.10
		 * @description
		 * Defines a list of permitted image source URL patterns for remote image optimization.
		 *
		 * `remotePatterns` can be configured with four properties:
		 * 1. protocol
		 * 2. hostname
		 * 3. port
		 * 4. pathname
		 *
		 * ```js
		 * {
		 *   image: {
		 *     // Example: allow processing all images from your aws s3 bucket
		 *     remotePatterns: [{
		 *       protocol: 'https',
		 *       hostname: '**.amazonaws.com',
		 *     }],
		 *   },
		 * }
		 * ```
		 *
		 * You can use wildcards to define the permitted `hostname` and `pathname` values as described below. Otherwise, only the exact values provided will be configured:
		 * `hostname`:
		 *   - Start with '**.' to allow all subdomains ('endsWith').
		 *   - Start with '*.' to allow only one level of subdomain.
		 *
		 * `pathname`:
		 *   - End with '/**' to allow all sub-routes ('startsWith').
		 *   - End with '/*' to allow only one level of sub-route.

		 */
		remotePatterns?: Partial<RemotePattern>[];

		/**
		 * @docs
		 * @name image.responsiveStyles
		 * @type {boolean}
		 * @default `false`
		 * @version 5.10.0
		 * @description
		 * Whether to automatically add global styles for responsive images. You should enable this option unless you are styling the images yourself.
		 *
		 * This option is only used when `layout` is set to `constrained`, `full-width`, or `fixed` using the configuration or the `layout` prop on the image component.
		 *
		 * See [the images docs](https://docs.astro.build/en/guides/images/#responsive-image-styles) for more information.
		 */
		responsiveStyles?: boolean;
		/**
		 * @docs
		 * @name image.layout
		 * @type {ImageLayout}
		 * @default `undefined`
		 * @version 5.10.0
		 * @description
		 * The default layout type for responsive images. Can be overridden by the `layout` prop on the image component.
		 * - `constrained` - The image will scale to fit the container, maintaining its aspect ratio, but will not exceed the specified dimensions.
		 * - `fixed` - The image will maintain its original dimensions.
		 * - `full-width` - The image will scale to fit the container, maintaining its aspect ratio.
		 *
		 * See [the `layout` component property](https://docs.astro.build/en/reference/modules/astro-assets/#layout) for more details.
		 */
		layout?: ImageLayout | undefined;
		/**
		 * @docs
		 * @name image.objectFit
		 * @type {ImageFit}
		 * @default `"cover"`
		 * @version 5.10.0
		 * @description
		 * The [`object-fit` CSS property value](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) for responsive images. Can be overridden by the `fit` prop on the image component.
		 * Requires a value for `layout` to be set.
		 *
		 * See [the `fit` component property](https://docs.astro.build/en/reference/modules/astro-assets/#fit) for more details.
		 */
		objectFit?: ImageFit;
		/**
		 * @docs
		 * @name image.objectPosition
		 * @type {string}
		 * @default `"center"`
		 * @version 5.10.0
		 * @description
		 * The default [`object-position` CSS property value](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) for responsive images. Can be overridden by the `position` prop on the image component.
		 * Requires a value for `layout` to be set.
		 *
		 * See [the `position` component property](https://docs.astro.build/en/reference/modules/astro-assets/#position) for more details.
		 */
		objectPosition?: string;
		/**
		 * @docs
		 * @name image.breakpoints
		 * @type {number[]}
		 * @default `[640, 750, 828, 1080, 1280, 1668, 2048, 2560] | [640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2560, 3200, 3840, 4480, 5120, 6016]`
		 * @version 5.10.0
		 * @description
		 * The breakpoints used to generate responsive images. Requires a value for `layout` to be set. The full list is not normally used,
		 * but is filtered according to the source and output size. The defaults used depend on whether a local or remote image service is used. For remote services
		 * the more comprehensive list is used, because only the required sizes are generated. For local services, the list is shorter to reduce the number of images generated.
		 */
		breakpoints?: number[];
	};

	/**
	 * @docs
	 * @kind heading
	 * @name Markdown Options
	 */
	markdown?: {
		/**
		 * @docs
		 * @name markdown.shikiConfig
		 * @typeraw {Partial<ShikiConfig>}
		 * @description
		 *
		 * Shiki is our default syntax highlighter. You can configure all options via the `markdown.shikiConfig` object:
		 *
		 * ```js title="astro.config.mjs"
		 * import { defineConfig } from 'astro/config';
		 *
		 * export default defineConfig({
		 *   markdown: {
		 *     shikiConfig: {
		 *       // Choose from Shiki's built-in themes (or add your own)
		 *       // https://shiki.style/themes
		 *       theme: 'dracula',
		 *       // Alternatively, provide multiple themes
		 *       // See note below for using dual light/dark themes
		 *       themes: {
		 *         light: 'github-light',
		 *         dark: 'github-dark',
		 *       },
		 *       // Disable the default colors
		 *       // https://shiki.style/guide/dual-themes#without-default-color
		 *       // (Added in v4.12.0)
		 *       defaultColor: false,
		 *       // Add custom languages
		 *       // Note: Shiki has countless langs built-in, including .astro!
		 *       // https://shiki.style/languages
		 *       langs: [],
		 *       // Add custom aliases for languages
		 *       // Map an alias to a Shiki language ID: https://shiki.style/languages#bundled-languages
		 *       // https://shiki.style/guide/load-lang#custom-language-aliases
		 *       langAlias: {
		 *         cjs: "javascript"
		 *       },
		 *       // Enable word wrap to prevent horizontal scrolling
		 *       wrap: true,
		 *       // Add custom transformers: https://shiki.style/guide/transformers
		 *       // Find common transformers: https://shiki.style/packages/transformers
		 *       transformers: [],
		 *     },
		 *   },
		 * });
		 * ```
		 *
		 * See the [code syntax highlighting guide](/en/guides/syntax-highlighting/) for usage and examples.
		 */
		shikiConfig?: Partial<ShikiConfig>;

		/**
		 * @docs
		 * @name markdown.syntaxHighlight
		 * @type {SyntaxHighlightConfig | SyntaxHighlightConfigType | false}
		 * @default `{ type: 'shiki', excludeLangs: ['math'] }`
		 * @description
		 * Which syntax highlighter to use for Markdown code blocks (\`\`\`), if any. This determines the CSS classes that Astro will apply to your Markdown code blocks.
	 	 * 
		 * - `shiki` - use the [Shiki](https://shiki.style) highlighter (`github-dark` theme configured by default)
		 * - `prism` - use the [Prism](https://prismjs.com/) highlighter and [provide your own Prism stylesheet](/en/guides/syntax-highlighting/#add-a-prism-stylesheet)
		 * - `false` - do not apply syntax highlighting.

		 * ```js
		 * {
		 *   markdown: {
		 *     // Example: Switch to use prism for syntax highlighting in Markdown
		 *     syntaxHighlight: 'prism',
		 *   }
		 * }
		 * ```
		 *
	 	 * For more control over syntax highlighting, you can instead specify a configuration object with the properties listed below.
		 */
		syntaxHighlight?:
			| {
					/**
					 * @docs
					 * @name markdown.syntaxHighlight.type
					 * @kind h4
					 * @type {'shiki' | 'prism'}
					 * @default `'shiki'`
					 * @version 5.5.0
					 * @description
					 *
					 * The default CSS classes to apply to Markdown code blocks.
					 * (If no other syntax highlighting configuration is needed, you can instead set `markdown.syntaxHighlight` directly to `shiki`, `prism`, or `false`.)
					 *
					 */
					type?: SyntaxHighlightConfigType;

					/**
					 * @docs
					 * @name markdown.syntaxHighlight.excludeLangs
					 * @kind h4
					 * @type {string[]}
					 * @default `['math']`
					 * @version 5.5.0
					 * @description
					 *
					 * An array of languages to exclude from the default syntax highlighting specified in `markdown.syntaxHighlight.type`.
					 * This can be useful when using tools that create diagrams from Markdown code blocks, such as Mermaid.js and D2.
					 *
					 * ```js title="astro.config.mjs"
					 * import { defineConfig } from 'astro/config';
					 *
					 * export default defineConfig({
					 *   markdown: {
					 *     syntaxHighlight: {
					 *       type: 'shiki',
					 *       excludeLangs: ['mermaid', 'math'],
					 *     },
					 *   },
					 * });
					 * ```
					 *
					 * */
					excludeLangs?: string[];
			  }
			| SyntaxHighlightConfigType
			| false;
		/**
		 * @docs
		 * @name markdown.remarkPlugins
		 * @type {RemarkPlugins}
		 * @description
		 * Pass [remark plugins](https://github.com/remarkjs/remark) to customize how your Markdown is built. You can import and apply the plugin function (recommended), or pass the plugin name as a string.
		 *
		 * ```js
		 * import remarkToc from 'remark-toc';
		 * {
		 *   markdown: {
		 *     remarkPlugins: [ [remarkToc, { heading: "contents"} ] ]
		 *   }
		 * }
		 * ```
		 */
		remarkPlugins?: RemarkPlugins;
		/**
		 * @docs
		 * @name markdown.rehypePlugins
		 * @type {RehypePlugins}
		 * @description
		 * Pass [rehype plugins](https://github.com/remarkjs/remark-rehype) to customize how your Markdown's output HTML is processed. You can import and apply the plugin function (recommended), or pass the plugin name as a string.
		 *
		 * ```js
		 * import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
		 * {
		 *   markdown: {
		 *     rehypePlugins: [rehypeAccessibleEmojis]
		 *   }
		 * }
		 * ```
		 */
		rehypePlugins?: RehypePlugins;
		/**
		 * @docs
		 * @name markdown.gfm
		 * @type {boolean}
		 * @default `true`
		 * @version 2.0.0
		 * @description
		 * Astro uses [GitHub-flavored Markdown](https://github.com/remarkjs/remark-gfm) by default. To disable this, set the `gfm` flag to `false`:
		 *
		 * ```js
		 * {
		 *   markdown: {
		 *     gfm: false,
		 *   }
		 * }
		 * ```
		 */
		gfm?: boolean;
		/**
		 * @docs
		 * @name markdown.smartypants
		 * @type {boolean}
		 * @default `true`
		 * @version 2.0.0
		 * @description
		 * Astro uses the [SmartyPants formatter](https://daringfireball.net/projects/smartypants/) by default. To disable this, set the `smartypants` flag to `false`:
		 *
		 * ```js
		 * {
		 *   markdown: {
		 *     smartypants: false,
		 *   }
		 * }
		 * ```
		 */
		smartypants?: boolean;
		/**
		 * @docs
		 * @name markdown.remarkRehype
		 * @type {RemarkRehype}
		 * @description
		 * Pass options to [remark-rehype](https://github.com/remarkjs/remark-rehype#api).
		 *
		 * ```js
		 * {
		 *   markdown: {
		 *     // Example: Translate the footnotes text to another language, here are the default English values
		 *     remarkRehype: { footnoteLabel: "Footnotes", footnoteBackLabel: "Back to reference 1"},
		 *   },
		 * };
		 * ```
		 */
		remarkRehype?: RemarkRehype;
	};

	/**
	 * @docs
	 * @kind heading
	 * @name i18n
	 * @type {object}
	 * @version 3.5.0
	 * @description
	 *
	 * Configures i18n routing and allows you to specify some customization options.
	 *
	 * See our guide for more information on [internationalization in Astro](/en/guides/internationalization/)
	 */
	i18n?: {
		/**
		 * @docs
		 * @name i18n.locales
		 * @type {Locales}
		 * @version 3.5.0
		 * @description
		 *
		 * A list of all locales supported by the website. This is a required field.
		 *
		 * Languages can be listed either as individual codes (e.g. `['en', 'es', 'pt-br']`) or mapped to a shared `path` of codes (e.g.  `{ path: "english", codes: ["en", "en-US"]}`). These codes will be used to determine the URL structure of your deployed site.
		 *
		 * No particular language code format or syntax is enforced, but your project folders containing your content files must match exactly the `locales` items in the list. In the case of multiple `codes` pointing to a custom URL path prefix, store your content files in a folder with the same name as the `path` configured.
		 */
		locales: [TLocales] extends [never] ? Locales : TLocales;

		/**
		 * @docs
		 * @name i18n.defaultLocale
		 * @type {string}
		 * @version 3.5.0
		 * @description
		 *
		 * The default locale of your website/application, that is one of the specified `locales`. This is a required field.
		 *
		 * No particular language format or syntax is enforced, but we suggest using lower-case and hyphens as needed (e.g. "es", "pt-br") for greatest compatibility.
		 */
		defaultLocale: [TLocales] extends [never] ? string : NormalizeLocales<NoInfer<TLocales>>;

		/**
		 * @docs
		 * @name i18n.fallback
		 * @type {Record<string, string>}
		 * @version 3.5.0
		 * @description
		 *
		 * The fallback strategy when navigating to pages that do not exist (e.g. a translated page has not been created).
		 *
		 * Use this object to declare a fallback `locale` route for each language you support. If no fallback is specified, then unavailable pages will return a 404.
		 *
		 * ##### Example
		 *
		 * The following example configures your content fallback strategy to redirect unavailable pages in `/pt-br/` to their `es` version, and unavailable pages in `/fr/` to their `en` version. Unavailable `/es/` pages will return a 404.
		 *
		 * ```js
		 * export default defineConfig({
		 * 	i18n: {
		 * 		defaultLocale: "en",
		 * 		locales: ["en", "fr", "pt-br", "es"],
		 * 		fallback: {
		 * 			pt: "es",
		 * 		  fr: "en"
		 * 		}
		 * 	}
		 * })
		 * ```
		 */
		fallback?: [TLocales] extends [never]
			? Record<string, string>
			: {
					[Locale in NormalizeLocales<NoInfer<TLocales>>]?: Exclude<
						NormalizeLocales<NoInfer<TLocales>>,
						Locale
					>;
				};

		/**
		 * @docs
		 * @name i18n.routing
		 * @type {object | "manual"}
		 * @default `object`
		 * @version 3.7.0
		 * @description
		 *
		 * Controls the routing strategy to determine your site URLs. Set this based on your folder/URL path configuration for your default language.
		 *
		 * ```js
		 * export default defineConfig({
		 * 	i18n: {
		 * 		defaultLocale: "en",
		 * 		locales: ["en", "fr"],
		 * 		routing: {
		 * 			prefixDefaultLocale: false,
		 * 			redirectToDefaultLocale: true,
		 * 			fallbackType: "redirect",
		 * 		}
		 * 	}
		 * })
		 * ```
		 *
		 * Since 4.6.0, this option can also be set to `manual`. When this routing strategy is enabled, Astro will **disable** its i18n middleware and no other `routing` options (e.g. `prefixDefaultLocale`) may be configured. You will be responsible for writing your own routing logic, or executing Astro's i18n middleware manually alongside your own.
		 *
		 * ```js
		 * export default defineConfig({
		 * 	i18n: {
		 * 		defaultLocale: "en",
		 * 		locales: ["en", "fr"],
		 * 		routing: "manual"
		 * 	}
		 * })
		 * ```
		 *
		 */
		routing?:
			| {
					/**
					 * @docs
					 * @name i18n.routing.prefixDefaultLocale
					 * @kind h4
					 * @type {boolean}
					 * @default `false`
					 * @version 3.7.0
					 * @description
					 *
					 * When `false`, only non-default languages will display a language prefix.
					 * The `defaultLocale` will not show a language prefix and content files do not exist in a localized folder.
					 *  URLs will be of the form `example.com/[locale]/content/` for all non-default languages, but `example.com/content/` for the default locale.
					 *
					 * When `true`, all URLs will display a language prefix.
					 * URLs will be of the form `example.com/[locale]/content/` for every route, including the default language.
					 * Localized folders are used for every language, including the default.
					 *
					 * ```js
					 * export default defineConfig({
					 * 	i18n: {
					 * 		defaultLocale: "en",
					 * 		locales: ["en", "fr", "pt-br", "es"],
					 * 		routing: {
					 * 			prefixDefaultLocale: true,
					 * 		}
					 * 	}
					 * })
					 * ```
					 */
					prefixDefaultLocale?: boolean;

					/**
					 * @docs
					 * @name i18n.routing.redirectToDefaultLocale
					 * @kind h4
					 * @type {boolean}
					 * @default `true`
					 * @version 4.2.0
					 * @description
					 *
					 * Configures whether or not the home URL (`/`) generated by `src/pages/index.astro`
					 * will redirect to `/[defaultLocale]` when `prefixDefaultLocale: true` is set.
					 *
					 * Set `redirectToDefaultLocale: false` to disable this automatic redirection at the root of your site:
					 * ```js
					 * // astro.config.mjs
					 * export default defineConfig({
					 *   i18n:{
					 *     defaultLocale: "en",
					 * 		locales: ["en", "fr"],
					 *     routing: {
					 *       prefixDefaultLocale: true,
					 *       redirectToDefaultLocale: false
					 *     }
					 *   }
					 * })
					 *```
					 * */
					redirectToDefaultLocale?: boolean;

					/**
					 * @docs
					 * @name i18n.routing.fallbackType
					 * @kind h4
					 * @type {"redirect" | "rewrite"}
					 * @default `"redirect"`
					 * @version 4.15.0
					 * @description
					 *
					 * When [`i18n.fallback`](#i18nfallback) is configured to avoid showing a 404 page for missing page routes, this option controls whether to [redirect](https://docs.astro.build/en/guides/routing/#redirects) to the fallback page, or to [rewrite](https://docs.astro.build/en/guides/routing/#rewrites) the fallback page's content in place.
					 *
					 * By default, Astro's i18n routing creates pages that redirect your visitors to a new destination based on your fallback configuration. The browser will refresh and show the destination address in the URL bar.
					 *
					 * When `i18n.routing.fallback: "rewrite"` is configured, Astro will create pages that render the contents of the fallback page on the original, requested URL.
					 *
					 * With the following configuration, if you have the file `src/pages/en/about.astro` but not `src/pages/fr/about.astro`, the `astro build` command will generate `dist/fr/about.html` with the same content as the `dist/en/about.html` page.
					 * Your site visitor will see the English version of the page at `https://example.com/fr/about/` and will not be redirected.
					 *
					 * ```js
					 * //astro.config.mjs
					 * export default defineConfig({
					 * 	 i18n: {
					 *     defaultLocale: "en",
					 *     locales: ["en", "fr"],
					 *     routing: {
					 *     	prefixDefaultLocale: false,
					 *     	fallbackType: "rewrite",
					 *     },
					 *     fallback: {
					 *     	fr: "en",
					 *     }
					 *   },
					 * })
					 * ```
					 */
					fallbackType?: 'redirect' | 'rewrite';
			  }
			| 'manual';

		/**
		 * @docs
		 * @name i18n.domains
		 * @type {Record<string, string> }
		 * @default `{}`
		 * @version 4.3.0
		 * @description
		 *
		 * Configures the URL pattern of one or more supported languages to use a custom domain (or sub-domain).
		 *
		 * When a locale is mapped to a domain, a `/[locale]/` path prefix will not be used.
		 * However, localized folders within `src/pages/` are still required, including for your configured `defaultLocale`.
		 *
		 * Any other locale not configured will default to a localized path-based URL according to your `prefixDefaultLocale` strategy (e.g. `https://example.com/[locale]/blog`).
		 *
		 * ```js
		 * //astro.config.mjs
		 * export default defineConfig({
		 * 	 site: "https://example.com",
		 * 	 output: "server", // required, with no prerendered pages
		 * 	 adapter: node({
		 * 	   mode: 'standalone',
		 * 	 }),
		 * 	 i18n: {
		 *     defaultLocale: "en",
		 *     locales: ["en", "fr", "pt-br", "es"],
		 *     prefixDefaultLocale: false,
		 *     domains: {
		 *       fr: "https://fr.example.com",
		 *       es: "https://example.es"
		 *     }
		 *   },
		 * })
		 * ```
		 *
		 * Both page routes built and URLs returned by the `astro:i18n` helper functions [`getAbsoluteLocaleUrl()`](https://docs.astro.build/en/reference/modules/astro-i18n/#getabsolutelocaleurl) and [`getAbsoluteLocaleUrlList()`](https://docs.astro.build/en/reference/modules/astro-i18n/#getabsolutelocaleurllist) will use the options set in `i18n.domains`.
		 *
		 * See the [Internationalization Guide](https://docs.astro.build/en/guides/internationalization/#domains) for more details, including the limitations of this feature.
		 */
		domains?: [TLocales] extends [never]
			? Record<string, string>
			: Partial<Record<NormalizeLocales<NoInfer<TLocales>>, string>>;
	};

	/**
	 * @docs
	 * @kind heading
	 * @name env
	 * @type {object}
	 * @default `{}`
	 * @version 5.0.0
	 * @description
	 *
	 * Configuration options for type-safe environment variables.
	 *
	 * See our guide for more information on [environment variables in Astro](/en/guides/environment-variables/).
	 */
	env?: {
		/**
		 * @docs
		 * @name env.schema
		 * @type {EnvSchema}
		 * @default `{}`
		 * @version 5.0.0
		 * @description
		 *
		 * An object that uses `envField` to define the data type and properties of your environment variables: `context` (client or server), `access` (public or secret), a `default` value to use, and whether or not this environment variable is `optional` (defaults to `false`).
		 * ```js
		 * // astro.config.mjs
		 * import { defineConfig, envField } from "astro/config"
		 *
		 * export default defineConfig({
		 *   env: {
		 *     schema: {
		 *       API_URL: envField.string({ context: "client", access: "public", optional: true }),
		 *       PORT: envField.number({ context: "server", access: "public", default: 4321 }),
		 *       API_SECRET: envField.string({ context: "server", access: "secret" }),
		 *     }
		 *   }
		 * })
		 * ```
		 *
		 * `envField` supports four data types: string, number, enum, and boolean. `context` and `access` are required properties for all data types. The following shows the complete list of properties available for each data type:
		 *
		 * ```js
		 * import { envField } from "astro/config"
		 *
		 * envField.string({
		 *    // context & access
		 *    optional: true,
		 *    default: "foo",
		 *    max: 20,
		 *    min: 1,
		 *    length: 13,
		 *    url: true,
		 *    includes: "oo",
		 *    startsWith: "f",
		 *    endsWith: "o",
		 * })
		 * envField.number({
		 *    // context & access
		 *    optional: true,
		 *    default: 15,
		 *    gt: 2,
		 *    min: 1,
		 *    lt: 3,
		 *    max: 4,
		 *    int: true,
		 * })
		 * envField.boolean({
		 *    // context & access
		 *    optional: true,
		 *    default: true,
		 * })
		 * envField.enum({
		 *    // context & access
		 *    values: ['foo', 'bar', 'baz'], // required
		 *    optional: true,
		 *    default: 'baz',
		 * })
		 * ```
		 */
		schema?: EnvSchema;

		/**
		 * @docs
		 * @name env.validateSecrets
		 * @type {boolean}
		 * @default `false`
		 * @version 5.0.0
		 * @description
		 *
		 * Whether or not to validate secrets on the server when starting the dev server or running a build.
		 *
		 * By default, only public variables are validated on the server when starting the dev server or a build, and private variables are validated at runtime only. If enabled, private variables will also be checked on start. This is useful in some continuous integration (CI) pipelines to make sure all your secrets are correctly set before deploying.
		 *
		 * ```js
		 * // astro.config.mjs
		 * import { defineConfig, envField } from "astro/config"
		 *
		 * export default defineConfig({
		 *   env: {
		 *     schema: {
		 *       // ...
		 *     },
		 *     validateSecrets: true
		 *   }
		 * })
		 * ```
		 */
		validateSecrets?: boolean;
	};

	/**
	 *
	 * @kind heading
	 * @name Legacy Flags
	 * @description
	 * To help some users migrate between versions of Astro, we occasionally introduce `legacy` flags.
	 * These flags allow you to opt in to some deprecated or otherwise outdated behavior of Astro
	 * in the latest version, so that you can continue to upgrade and take advantage of new Astro releases.
	 */
	legacy?: {
		/**
		 *
		 * @name legacy.collections
		 * @type {boolean}
		 * @default `false`
		 * @version 5.0.0
		 * @description
		 * Enable legacy behavior for content collections.
		 *
		 * ```js
		 * // astro.config.mjs
		 * import { defineConfig } from 'astro/config';
		 * export default defineConfig({
		 *   legacy: {
		 *     collections: true
		 *   }
		 * });
		 * ```
		 *
		 * If enabled, `data` and `content` collections (only) are handled using the legacy content collections implementation. Collections with a `loader` (only) will continue to use the Content Layer API instead. Both kinds of collections may exist in the same project, each using their respective implementations.
		 *
		 *  The following limitations continue to exist:
		 *
		 * - Any legacy (`type: 'content'` or `type: 'data'`) collections must continue to be located in the `src/content/` directory.
		 * - These legacy collections will not be transformed to implicitly use the `glob()` loader, and will instead be handled by legacy code.
		 * - Collections using the Content Layer API (with a `loader` defined) are forbidden in `src/content/`, but may exist anywhere else in your project.
		 *
		 * When you are ready to remove this flag and migrate to the new Content Layer API for your legacy collections, you must define a collection for any directories in `src/content/` that you want to continue to use as a collection. It is sufficient to declare an empty collection, and Astro will implicitly generate an appropriate definition for your legacy collections:
		 *
		 * ```js
		 * // src/content.config.ts
		 * import { defineCollection, z } from 'astro:content';
		 *
		 * const blog = defineCollection({ })
		 *
		 * export const collections = { blog };
		 * ```
		 *
		 */
		collections?: boolean;
	};

	/**
	 *
	 * @kind heading
	 * @name Experimental Flags
	 * @description
	 * Astro offers experimental flags to give users early access to new features.
	 * These flags are not guaranteed to be stable.
	 */
	experimental?: {
		/**
		 *
		 * @name experimental.clientPrerender
		 * @type {boolean}
		 * @default `false`
		 * @version 4.2.0
		 * @description
		 * Enables pre-rendering your prefetched pages on the client in supported browsers.
		 *
		 * This feature uses the experimental [Speculation Rules Web API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API) and enhances the default `prefetch` behavior globally to prerender links on the client.
		 * You may wish to review the [possible risks when prerendering on the client](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API#unsafe_prefetching) before enabling this feature.
		 *
		 * Enable client side prerendering in your `astro.config.mjs` along with any desired `prefetch` configuration options:
		 *
		 * ```js
		 * // astro.config.mjs
		 * {
		 *   prefetch: {
		 *     prefetchAll: true,
		 *     defaultStrategy: 'viewport',
		 *   },
		 * 	experimental: {
		 * 		clientPrerender: true,
		 * 	},
		 * }
		 * ```
		 *
		 * Continue to use the `data-astro-prefetch` attribute on any `<a />` link on your site to opt in to prefetching.
		 * Instead of appending a `<link>` tag to the head of the document or fetching the page with JavaScript, a `<script>` tag will be appended with the corresponding speculation rules.
		 *
		 * Client side prerendering requires browser support. If the Speculation Rules API is not supported, `prefetch` will fallback to the supported strategy.
		 *
		 * See the [Prefetch Guide](https://docs.astro.build/en/guides/prefetch/) for more `prefetch` options and usage.
		 */
		clientPrerender?: boolean;

		/**
		 *
		 * @name experimental.contentIntellisense
		 * @type {boolean}
		 * @default `false`
		 * @version 5.x
		 * @description
		 *
		 * Enables Intellisense features (e.g. code completion, quick hints) for your content collection entries in compatible editors.
		 *
		 * When enabled, this feature will generate and add JSON schemas to the `.astro` directory in your project. These files can be used by the Astro language server to provide Intellisense inside content files (`.md`, `.mdx`, `.mdoc`).
		 *
		 * ```js
		 * {
		 *   experimental: {
		 *     contentIntellisense: true,
		 *   },
		 * }
		 * ```
		 *
		 * To use this feature with the Astro VS Code extension, you must also enable the `astro.content-intellisense` option in your VS Code settings. For editors using the Astro language server directly, pass the `contentIntellisense: true` initialization parameter to enable this feature.
		 */
		contentIntellisense?: boolean;

		/**
		 *
		 * @name experimental.fonts
		 * @type {FontFamily[]}
		 * @version 5.7
		 * @description
		 *
		 * This experimental feature allows you to use fonts from your filesystem and various providers
		 * (eg. Google, Fontsource, Bunny...) through a unified, fully customizable and type-safe API.
		 *
		 * Web fonts can impact page performance at both load time and rendering time. This feature provides
		 * automatic [optimization](https://web.dev/learn/performance/optimize-web-fonts) by creating
		 * preload links and optimized fallbacks. This API includes opinionated defaults to keep your sites lightweight and performant (e.g. minimal font files downloaded) while allowing for extensive customization so you can opt in to greater control.
		 *
		 * For a complete overview, and to give feedback on this experimental API,
		 * see the [Fonts RFC](https://github.com/withastro/roadmap/pull/1039).
		 */
		fonts?: [TFontFamilies] extends [never] ? FontFamily[] : TFontFamilies;

		/**
		 * @name experimental.headingIdCompat
		 * @type {boolean}
		 * @default `false`
		 * @version 5.5.x
		 * @description
		 *
		 * Enables full compatibility of Markdown headings IDs with common platforms such as GitHub and npm.
		 *
		 * When enabled, IDs for headings ending with non-alphanumeric characters, e.g. `<Picture />`, will
		 * include a trailing `-`, matching standard behavior in other Markdown tooling.
		 */
		headingIdCompat?: boolean;

		/**
		 * @name experimental.csp
		 * @type {boolean | object}
		 * @default `false`
		 * @version 5.9.0
		 * @description
		 *
		 * Enables built-in support for Content Security Policy (CSP). For more information,
		 * refer to the [experimental CSP documentation](https://docs.astro.build/en/reference/experimental-flags/csp/)
		 *
		 */
		csp?:
			| boolean
			| {
					/**
					 * @name experimental.csp.algorithm
					 * @type {"SHA-256" | "SHA-384" | "SHA-512"}
					 * @default `'SHA-256'`
					 * @version 5.9.0
					 * @description
					 *
					 * The [hash function](https://developer.mozilla.org/en-US/docs/Glossary/Hash_function) to use to generate the hashes of the styles and scripts emitted by Astro.
					 *
					 * ```js
					 * import { defineConfig } from 'astro/config';
					 *
					 * export default defineConfig({
					 *   experimental: {
					 *     csp: {
					 *       algorithm: 'SHA-512'
					 *     }
					 *   }
					 * });
					 * ```
					 */
					algorithm?: CspAlgorithm;

					/**
					 * @name experimental.csp.styleDirective
					 * @type {{ hashes?: CspHash[], resources?: string[] }}
					 * @default `undefined`
					 * @version 5.9.0
					 * @description
					 *
					 * A configuration object that allows you to override the default sources for the `style-src` directive
					 * with the `resources` property, or to provide additional `hashes` to be rendered.
					 *
					 * These properties are added to all pages and completely override Astro's default resources, not add to them.
					 * Therefore, you must explicitly specify any default values that you want to be included.
					 */
					styleDirective?: {
						/**
						 * @name experimental.csp.styleDirective.hashes
						 * @type {CspHash[]}
						 * @default `[]`
						 * @version 5.9.0
						 * @description
						 *
						 * A list of additional hashes added to the `style-src` directive.
						 *
						 * If you have external styles that aren't generated by Astro, this configuration option allows you to provide additional hashes to be rendered.
						 *
						 * You must provide hashes that start with `sha384-`, `sha512-` or `sha256-`. Other values will cause a validation error. These hashes are added to all pages.
						 *
						 * ```js
						 * import { defineConfig } from 'astro/config';
						 *
						 * export default defineConfig({
						 *   experimental: {
						 *     csp: {
						 *       styleDirective: {
						 *         hashes: [
						 *           "sha384-styleHash",
						 *           "sha512-styleHash",
						 *           "sha256-styleHash"
						 *         ]
						 *       }
						 *     }
						 *   }
						 * });
						 * ```
						 */
						hashes?: CspHash[];

						/**
						 * @name experimental.csp.styleDirective.resources
						 * @type {string[]}
						 * @default `[]`
						 * @version 5.9.0
						 * @description
						 *
						 * A list of resources applied to the `style-src` directive. These resources are added to all pages and will override Astro's defaults.
						 *
						 * ```js
						 * import { defineConfig } from 'astro/config';
						 *
						 * export default defineConfig({
						 *   experimental: {
						 *     csp: {
						 *       styleDirective: {
						 *         resources: [
						 *           "'self'",
						 *           "https://styles.cdn.example.com"
						 *         ]
						 *       }
						 *     }
						 *   }
						 * });
						 * ```
						 */
						resources?: string[];
					};

					/**
					 * @name experimental.csp.scriptDirective
					 * @type {{ hashes?: CspHash[], resources?: string[], strictDynamic?: boolean }}
					 * @default `undefined`
					 * @version 5.9.0
					 * @description
					 *
					 * A configuration object that allows you to override the default sources for the `script-src` directive
					 * with the `resources` property, or to provide additional `hashes` to be rendered.
					 *
					 * These properties are added to all pages and completely override Astro's default resources, not add to them.
					 * Therefore, you must explicitly specify any default values that you want to be included.
					 *
					 */
					scriptDirective?: {
						/**
						 * @name experimental.csp.scriptDirective.hashes
						 * @type {CspHash[]}
						 * @default `[]`
						 * @version 5.9.0
						 * @description
						 *
						 * A list of additional hashes added to the `script-src` directive.
						 *
						 * If you have external scripts that aren't generated by Astro, or inline scripts, this configuration option allows you to provide additional hashes to be rendered.
						 *
						 * You must provide hashes that start with `sha384-`, `sha512-` or `sha256-`. Other values will cause a validation error. These hashes are added to all pages.
						 *
						 * ```js
						 * import { defineConfig } from 'astro/config';
						 *
						 * export default defineConfig({
						 *   experimental: {
						 *     csp: {
						 *       scriptDirective: {
						 *         hashes: [
						 *           "sha384-scriptHash",
						 *           "sha512-scriptHash",
						 *           "sha256-scriptHash"
						 *         ]
						 *       }
						 *     }
						 *   }
						 * });
						 * ```
						 */
						hashes?: CspHash[];

						/**
						 * @name experimental.csp.scriptDirective.resources
						 * @type {string[]}
						 * @default `[]`
						 * @version 5.9.0
						 * @description
						 *
						 * A list of resources applied to the `script-src` directive. These resources are added to all pages and will override Astro's defaults.
						 *
						 * ```js
						 * import { defineConfig } from 'astro/config';
						 *
						 * export default defineConfig({
						 *   experimental: {
						 *     csp: {
						 *       scriptDirective: {
						 *         resources: [
						 *           "'self'",
						 *           "https://cdn.example.com"
						 *         ]
						 *       }
						 *     }
						 *   }
						 * });
						 * ```
						 *
						 */
						resources?: string[];

						/**
						 * @name experimental.csp.scriptDirective.strictDynamic
						 * @type {boolean}
						 * @default `false`
						 * @version 5.9.0
						 * @description
						 *
						 * Enables the keyword `strict-dynamic` to support the dynamic injection of scripts.
						 *
						 * ```js
						 * import { defineConfig } from 'astro/config';
						 *
						 * export default defineConfig({
						 *   experimental: {
						 *     csp: {
						 *       scriptDirective: {
						 *         strictDynamic: true
						 *       }
						 *     }
						 *   }
						 * });
						 * ```
						 */
						strictDynamic?: boolean;
					};

					/**
					 * @name experimental.csp.directives
					 * @type {string[]}
					 * @default `[]`
					 * @version 5.9.0
					 * @description
					 *
					 * An array of additional directives to add the content of the `Content-Security-Policy` `<meta>` element.
					 *
					 * Use this configuration to add other directive definitions such as `default-src`, `image-src`, etc.
					 *
					 * ##### Example
					 *
					 * You can define a directive to fetch images only from a CDN `cdn.example.com`.
					 *
					 * ```js
					 * export default defineConfig({
					 * 	experimental: {
					 * 		csp: {
					 * 			directives: [
					 * 				"image-src 'https://cdn.example.com"
					 * 			]
					 * 		}
					 * 	}
					 * })
					 * ```
					 *
					 */
					directives?: CspDirective[];
			  };

		/**
		 * @name experimental.preserveScriptOrder
		 * @type {boolean}
		 * @default `false`
		 * @version 5.5
		 * @description
		 *
		 * When enabled, `<script>` and `<style>` tags are rendered in the same order as they are defined.
		 *
		 * ## Example
		 *
		 * Consider the following component:
		 *
		 * ```html
		 * <p>I am a component</p>
		 * <style>
		 *   body {
		 *     background: red;
		 *   }
		 * </style>
		 * <style>
		 *   body {
		 *     background: yellow;
		 *   }
		 * </style>
		 * ```
		 *
		 * By default, it will generate a CSS style where `red` will be applied:
		 *
		 * ```css
		 * body {background:#ff0} body {background:red}
		 * ```
		 *
		 * When this new option is set to `true`, the generated CSS style will apply `yellow`:
		 *
		 * ```css
		 * body {background:red} body {background:#ff0}
		 * ```
		 *
		 */
		preserveScriptOrder?: boolean;

		/**
		 * @name experimental.liveContentCollections
		 * @type {boolean}
		 * @default `false`
		 * @version 5.x
		 * @description
		 * Enables the use of live content collections.
		 *
		 */
		liveContentCollections?: boolean;

		/**
		 * @name experimental.rawEnvValues
		 * @type {boolean}
		 * @default `false`
		 * @version 5.12
		 * @description
		 *
		 * Disables coercion of `import.meta.env` values that are populated from `process.env`, allowing you to use the raw value.
		 *
		 * By default, Astro converts your environment variables used through `import.meta.env` in some cases, and this can prevent
		 * access to some values such as the strings `"true"` (which is converted to a boolean value), and `"1"` (which is converted
		 * to a number).
		 *
		 * This flag aligns `import.meta.env`'s behavior in Astro with [Vite](https://vite.dev/guide/env-and-mode.html#env-variables).
		 *
		 * See the [experimental raw environment variables guide](https://docs.astro.build/en/reference/experimental-flags/raw-env-values/) for more information.
		 */
		rawEnvValues?: boolean;
	};
}

/**
 * Resolved Astro Config
 *
 * Config with user settings along with all defaults filled in.
 */
export interface AstroConfig extends AstroConfigType {
	// Public:
	// This is a more detailed type than zod validation gives us.
	// TypeScript still confirms zod validation matches this type.
	integrations: AstroIntegration[];
}
/**
 * An inline Astro config that takes highest priority when merging with the user config,
 * and includes inline-specific options to configure how Astro runs.
 */
export interface AstroInlineConfig extends AstroUserConfig, AstroInlineOnlyConfig {}
export interface AstroInlineOnlyConfig {
	/**
	 * A custom path to the Astro config file. If relative, it'll resolve based on the current working directory.
	 * Set to false to disable loading any config files.
	 *
	 * If this value is undefined or unset, Astro will search for an `astro.config.(js,mjs,ts)` file relative to
	 * the `root` and load the config file if found.
	 *
	 * The inline config passed in this object will take the highest priority when merging with the loaded user config.
	 */
	configFile?: string | false;
	/**
	 * The mode used when developing or building your site. It's passed to Vite that affects the value of `import.meta.env.MODE`
	 * and how `.env` files are loaded, which also affects the values of `astro:env`. See the
	 * [environment variables documentation](https://docs.astro.build/en/guides/environment-variables/) for more details.
	 *
	 * To output a development-based build, you can run `astro build` with the `--devOutput` flag.
	 *
	 * @default "development" for `astro dev`, "production" for `astro build`
	 */
	mode?: string;
	/**
	 * The logging level to filter messages logged by Astro.
	 * - "debug": Log everything, including noisy debugging diagnostics.
	 * - "info": Log informational messages, warnings, and errors.
	 * - "warn": Log warnings and errors.
	 * - "error": Log errors only.
	 * - "silent": No logging.
	 *
	 * @default "info"
	 */
	logLevel?: LoggerLevel;
	/**
	 * Clear the content layer cache, forcing a rebuild of all content entries.
	 */
	force?: boolean;
	/**
	 * @internal for testing only, use `logLevel` instead.
	 */
	logger?: Logger;
}
