import * as path from "path";
import * as sass from "sass.js";
import { parseCSS, evaluateCSS, SyntheticWindow, CSSExpression } from "@tandem/synthetic-browser";
import { BaseSandboxModule, SandboxModuleFactoryDependency } from "@tandem/sandbox";

const _cache = {};

// TODO - SCSSModuleLoader

export class SCSSModule extends BaseSandboxModule {
  public ast: CSSExpression;

  async load() {
    sass.importer(async (request, done) => {
      const filePath = request.path || await this.sandbox.importer.resolve(request.current, path.dirname(this.filePath));
      const content = await this.sandbox.importer.readFile(filePath);
      done({ path: filePath, content: content || " " });
    });

    return new Promise((resolve, reject) => {
      sass.compile(this.content, {}, (result) => {

        // 3 = empty string exception
        if (result.status !== 0 && result.status !== 3) return reject(result);
        // resolve(this.ast = parseCSS(String(result.text || "")));
      });
    });
  }

  evaluate() {
    // return evaluateCSS(this.ast) as any;
  }
}

export class HTMLSCSSDOMModule extends SCSSModule {
  async load() {
    await super.load();
    // (<SyntheticWindow>this.sandbox.global).window.document.styleSheets.push(super.evaluate());
  }
  evaluate2() {
    return {};
  }
}