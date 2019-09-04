import { FetchContext, Middleware, Swork } from "swork";
import { RequestDelegate } from "swork/dist/swork";
import { link } from "./../src/index";
import { getFetchEvent, mockInit } from "./mock-helper";

declare var global: any;

function build(instance: Swork): RequestDelegate {
    // tslint:disable-next-line:no-string-literal
    return instance["build"]();
}

describe("link tests", () => {
    let instance: Swork;
    let instance2: Swork;
    let context: FetchContext;

    beforeEach(() => {
        mockInit();

        instance = new Swork();
        instance2 = new Swork();

        context = new FetchContext(getFetchEvent("http://www.example.com"));
        
        global._swork = undefined;
    });

    test("swork.link adds configuration", () => {
        expect(global._swork).toBeFalsy();
        
        instance.targetLink();

        expect(global._swork).toBeTruthy();
        expect(global._swork.linkMap).toBeTruthy();

        const linkMap: Map<string, any> = global._swork.linkMap;

        expect(linkMap.size).toBe(1);
        expect(linkMap.has("default")).toBeTruthy();

        const config = linkMap.get("default");

        expect(config.key).toBe("default");
        expect(config.link).toBeTruthy();

        instance.targetLink("not-default");

        expect(linkMap.size).toBe(2);
        expect(linkMap.has("not-default")).toBeTruthy();
    });

    test("link middleware adds configuration", () => {
        expect(global._swork).toBeFalsy();
        
        link();

        expect(global._swork).toBeTruthy();
        expect(global._swork.linkMap).toBeTruthy();

        const linkMap: Map<string, any> = global._swork.linkMap;

        expect(linkMap.size).toBe(1);
        expect(linkMap.has("default")).toBeTruthy();

        const config = linkMap.get("default");

        expect(config.key).toBe("default");
        expect(config.link).toBeFalsy();

        link("not-default");

        expect(linkMap.size).toBe(2);
        expect(linkMap.has("not-default")).toBeTruthy();
    });

    test("link middleware executes when attached to instance", async (done) => {
        const middlewareCalled: string[] = [];
        
        instance.use((_, next) => { 
                middlewareCalled.push("middleware 1");
                return next(); 
            })
            .use(link())
            .use((_, next) => { 
                middlewareCalled.push("middleware 3"); 
                return next();
            });
        
        instance2.use((_, next) => { 
                middlewareCalled.push("middleware 2"); 
                return next();
            })
            .targetLink();

        const delegate = build(instance);

        await delegate(context);

        expect(middlewareCalled.length).toBe(3);
        expect(middlewareCalled[0]).toBe("middleware 1");
        expect(middlewareCalled[1]).toBe("middleware 2");
        expect(middlewareCalled[2]).toBe("middleware 3");

        done();
    });

    test("link middleware executes when not attached to instance", async (done) => {
        const middlewareCalled: string[] = [];
        
        instance.use((_, next) => { 
                middlewareCalled.push("middleware 1");
                return next(); 
            })
            .use(link())
            .use((_, next) => { 
                middlewareCalled.push("middleware 3"); 
                return next();
            });

        const delegate = build(instance);

        await delegate(context);

        expect(middlewareCalled.length).toBe(2);
        expect(middlewareCalled[0]).toBe("middleware 1");
        expect(middlewareCalled[1]).toBe("middleware 3");

        done();
    });
});
