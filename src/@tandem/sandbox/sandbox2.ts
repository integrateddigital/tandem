import { WrapBus } from "mesh";
import { BundleAction } from "./actions";
import { Bundle, Bundler } from "./bundle";
import { SandboxModuleEvaluatorFactoryDependency, BundlerDependency } from "./dependencies";
import { IActor, Action, Dependencies, PropertyChangeAction, Observable } from "@tandem/common";

export type sandboxBundleEvaluatorType = { new(): ISandboxBundleEvaluator };
export interface ISandboxBundleEvaluator {
  evaluate(module: Sandbox2Module): void;
}

export class Sandbox2Module {
  public exports: any;
  readonly editor: any;
  constructor(readonly sandbox: Sandbox2, readonly bundle: Bundle) {
    this.exports = {};
  }

  get filePath() {
    return this.bundle.filePath;
  }
}

export class Sandbox2 extends Observable {
  private _modules: any;
  private _entry: Bundle;
  private _mainModule: any;
  private _entryObserver: IActor;
  private _bundler: Bundler;
  private _global: any;
  private _exports: any;
  private _revaluating: boolean;

  constructor(private _dependencies: Dependencies, private createGlobal: () => any = () => {}) {
    super();
    this._entryObserver = new WrapBus(this.onEntryAction.bind(this));
    this._modules = {};
    this._bundler = BundlerDependency.getInstance(_dependencies);
  }

  get exports(): any {
    return this._exports;
  }

  get global(): any {
    return this._global;
  }

  async open(bundle: Bundle) {
    if (this._entry) {
      this._entry.unobserve(this._entryObserver);
    }
    this._entry = bundle;
    this._entry.observe(this._entryObserver);

    if (this._entry.ready) {
      this.evaluate();
    }
  }

  get ready() {
    return this._entry.ready;
  }

  require(filePath: string): Object {
    if (this._modules[filePath]) {
      return this._modules[filePath].exports;
    }

    const bundle = this._bundler.collection.find((entity) => entity.filePath === filePath);

    if (!bundle) {
      throw new Error(`${filePath} does not exist in the ${this._entry.filePath} bundle.`);
    }

    if (!bundle.ready) {
      throw new Error(`Trying to require bundle ${filePath} that is not ready yet.`);
    }

    const module = this._modules[filePath] = new Sandbox2Module(this, bundle);
    const now = Date.now();

    console.log("evaluate start", filePath);


    // TODO - cache evaluator here
    const evaluatorFactoryDepedency = SandboxModuleEvaluatorFactoryDependency.find(null, bundle.content.type, this._dependencies);

    if (!evaluatorFactoryDepedency) {
      throw new Error(`Cannot evaluate ${filePath} in sandbox.`);
    }

    evaluatorFactoryDepedency.create().evaluate(module);

    console.log("evaluate done", filePath, Date.now() - now);
    return this.require(filePath);
  }

  protected onEntryAction(action: Action) {
    if (action.type === BundleAction.BUNDLE_READY) {
      console.info("restarting evaluation ", this._entry.filePath);
      this.evaluate();
    }
  }

  public evaluate() {
    const exports = this._exports;
    const global  = this._global;
    this._global  = this.createGlobal();
    this.notify(new PropertyChangeAction("global", this._global, global));
    this._modules = {};
    this._exports = this.require(this._entry.filePath);
    this.notify(new PropertyChangeAction("exports", this._exports, exports));
  }
}