import { FetchContext, Swork } from "swork";
import { RequestDelegate } from "swork/dist/swork";

declare module "swork" {
    // tslint:disable-next-line:interface-name
    interface Swork {
        targetLink(key?: string): void;
    }
}

interface ILinkConfiguration {
    key: string;
    link: Swork;
}

interface ISworkConfiguration {
    linkMap: Map<string, ILinkConfiguration>;
}

declare global {
    // tslint:disable-next-line:interface-name
    interface WorkerGlobalScope {
        _swork: ISworkConfiguration;
    }
}

// tslint:disable-next-line:only-arrow-functions
Swork.prototype.targetLink = function(key?: string) {
    const linkConfiguration = getLinkConfiguration(key);

    linkConfiguration.link = this;
};

function getLinkConfiguration(key?: string): ILinkConfiguration {
    key = key || "default";

    if (!self._swork) {
        self._swork = {
            linkMap: new Map<string, ILinkConfiguration>(),
        };
    }

    const linkMap = self._swork.linkMap;

    let linkConfiguration: ILinkConfiguration;

    if (!linkMap.has(key)) {
        linkConfiguration = {
            key,
        } as ILinkConfiguration;
        linkMap.set(key, linkConfiguration);
    } else {
        linkConfiguration = linkMap.get(key)!;
    }

    return linkConfiguration;
}

export function link(key?: string) {
    key = key || "default";

    const linkConfiguration = getLinkConfiguration(key);

    return async (context: FetchContext, next: () => Promise<void>) => {
        if (linkConfiguration.link) {
            // tslint:disable-next-line:no-string-literal
            const middleware = linkConfiguration.link["middlewares"];

            const requestDelegate: RequestDelegate = 
                (new Swork())
                .use(middleware)
                .use(() => next())
                // tslint:disable-next-line:no-string-literal
                ["build"]();

            await requestDelegate(context);
        } else {
            await next();
        }
    };
}
