import * as _ from "lodash";
import * as MongoDB from "mongodb";

export class Omnom {
    constructor(public options: {
        atomicNumbers?: boolean;
    } = {}) {
        this._changes = {};
    }

    private _changes: {
        $set?: any;
        $unset?: any;
        $inc?: any;
        $push?: any;
        $pull?: any;
        $pullAll?: any;
    };
    get changes(): {
        $set?: any;
        $unset?: any;
        $inc?: any;
        $push?: any;
        $pull?: any;
        $pullAll?: any;
    } {
        return this._changes;
    }

    diff(original: number, modified: number): Omnom;
    diff(original: [any], modified: any[]): Omnom;
    diff(original: MongoDB.ObjectID, modified: MongoDB.ObjectID): Omnom;
    diff(original: Object, modified: Object): Omnom;
    diff(original: any, modified: any): Omnom {
        this.onObject(original, modified);
        return this;
    }

    static diff(original: number, modified: number, options?: {
        atomicNumbers?: boolean;
    });
    static diff(original: [any], modified: any[], options?: {
        atomicNumbers?: boolean;
    });
    static diff(original: MongoDB.ObjectID, modified: MongoDB.ObjectID, options?: {
        atomicNumbers?: boolean;
    });
    static diff(original: Object, modified: Object, options?: {
        atomicNumbers?: boolean;
    });
    static diff(original: any, modified: any, options?: {
        atomicNumbers?: boolean;
    }) {
        return new Omnom(options).diff(original, modified).changes;
    }

    private onObject(original: number, modified: number, changePath?: string): void;
    private onObject(original: [any], modified: any[], changePath?: string): void;
    private onObject(original: MongoDB.ObjectID, modified: MongoDB.ObjectID, changePath?: string): void;
    private onObject(original: Object, modified: Object, changePath?: string): void;
    private onObject(original: any, modified: any, changePath?: string): void {
        if (original === undefined || original === null)
            return (original !== modified) && this.set(changePath, modified);

        if (typeof original === "number" && typeof modified === "number" && original !== modified) {
            if (this.options.atomicNumbers) return this.inc(changePath, modified - original);
            return this.set(changePath, modified);
        }

        if (Array.isArray(original) && Array.isArray(modified))
            return this.onArray(original, modified, changePath);

        if (original instanceof MongoDB.ObjectID && modified instanceof MongoDB.ObjectID)
            return !original.equals(modified) && this.set(changePath, modified);

        if (!_.isPlainObject(original) || !_.isPlainObject(modified))
            return !_.isEqual(original, modified) && this.set(changePath, modified);

        _.each(modified, (value, key) => {
            // Handle array diffs in their own special way
            if (Array.isArray(value) && Array.isArray(original[key])) this.onArray(original[key], value, this.resolve(changePath, key));

            // Otherwise, just keep going
            else this.onObject(original[key], value, this.resolve(changePath, key));
        }, this);

        // Unset removed properties
        _.each(original, (value, key) => {
            if (modified[key] === undefined) return this.unset(this.resolve(changePath, key));
        }, this);
    }

    private onArray(original: any[], modified: any[], changePath: string): void {
        // Check if we can get from original => modified using just pulls
        if (original.length > modified.length) {
            return this.onSmallerArray(original, modified, changePath);
        }

        // Check if we can get from original => modified using just pushes
        if (original.length < modified.length) {
            return this.onLargerArray(original, modified, changePath);
        }

        // Otherwise, we need to use $set to generate the new array
        return this.onSimilarArray(original, modified, changePath);
    }

    private onSmallerArray(original: any[], modified: any[], changePath: string): void {
      let  pulls = [];
      let i = 0;
      let j = 0;
      
      for (; i < original.length && j < modified.length; i++) {
          if (this.almostEqual(original[i], modified[j])) j++;
          else pulls.push(original[i]);
      }

      for (; i < original.length; i++)
          pulls.push(original[i]);

      if (j === modified.length) {
          if (pulls.length === 1) return this.pull(changePath, pulls[0]);
          // We can complete using just pulls
          return pulls.forEach((pull) => this.pull(changePath, pull));
      }

      // If we have a smaller target array than our source, we will need to re-create it
      // regardless (if we want to do so in a single operation anyway)
      else return this.set(changePath, modified);
    }
    
    private onLargerArray(original: any[], modified: any[], changePath: string): void {
      let canPush = true;
      for (let i = 0; i < original.length; i++)
          if (this.almostEqual(original[i], modified[i]) < 1) {
              canPush = false;
              break;
          }

      if (canPush) {
          for (let i = original.length; i < modified.length; i++)
              this.push(changePath, modified[i]);
          return;
      }
      
      return this.onSimilarArray(original, modified, changePath);
    }
    
    private onSimilarArray(original: any[], modified: any[], changePath: string): void {
      // Check how many manipulations would need to be performed, if it's more than half the array size
      // then rather re-create the array
      let sets = [];
      let partials = [];
      for (let i = 0; i < modified.length; i++) {
          let equality = this.almostEqual(original[i], modified[i]);
          if (equality === 0) sets.push(i);
          else if (equality < 1) partials.push(i);
      }

      if (sets.length > modified.length / 2)
          return this.set(changePath, modified);

      for (let i = 0; i < sets.length; i++)
          this.set(this.resolve(changePath, sets[i].toString()), modified[sets[i]]);

      for (let i = 0; i < partials.length; i++)
          this.onObject(original[partials[i]], modified[partials[i]], this.resolve(changePath, partials[i].toString()));
    }

    private set(path: string, value: any) {
        if (!this.changes.$set)
            this.changes.$set = {};

        this.changes.$set[path] = value;
    }

    private unset(path: string) {
        if (!this.changes.$unset)
            this.changes.$unset = {};

        this.changes.$unset[path] = 1;
    }

    private inc(path: string, value: number) {
        if (!this.changes.$inc)
            this.changes.$inc = {};

        this.changes.$inc[path] = value;
    }

    private push(path: string, value: any) {
        if (!this.changes.$push)
            this.changes.$push = {};

        if (this.changes.$push[path]) {
            if (this.changes.$push[path].$each)
                this.changes.$push[path].$each.push(value);
            else
                this.changes.$push[path] = { $each: [this.changes.$push[path], value] };
        } else this.changes.$push[path] = value;
    }

    private pull(path: string, value: any) {
        if (!this.changes.$pull)
            this.changes.$pull = {};

        if (this.changes.$pullAll && this.changes.$pullAll[path]) {
            return this.changes.$pullAll[path].push(value);
        }

        if (this.changes.$pull[path]) {
            this.pullAll(path, [this.changes.$pull[path], value]);
            delete this.changes.$pull[path];
            if (_.keys(this.changes.$pull).length === 0)
                delete this.changes.$pull;
            return;
        }

        this.changes.$pull[path] = value;
    }

    private pullAll(path: string, values: any[]) {
        if (!this.changes.$pullAll)
            this.changes.$pullAll = {};

        this.changes.$pullAll[path] = values;
    }

    private resolve(...args) {
        let validArguments = [];
        args.forEach(function (arg) {
            if (arg) validArguments.push(arg);
        });
        return validArguments.join(".");
    }

    private almostEqual(o1: Object, o2: Object);
    private almostEqual(o1: any, o2: any) {
        if (!_.isPlainObject(o1) || !_.isPlainObject(o2)) return o1 == o2 ? 1 : 0;

        let object1KeyIndex, object1Keys = Object.keys(o1);
        let object2Keys = Object.keys(o2);

        let commonKeys = [];
        for (object1KeyIndex = 0; object1KeyIndex < object1Keys.length; object1KeyIndex++)
            if (~object2Keys.indexOf(object1Keys[object1KeyIndex])) commonKeys.push(object1Keys[object1KeyIndex]);

        let totalKeys = object1Keys.length + object2Keys.length - commonKeys.length;
        let keysDifference = totalKeys - commonKeys.length;

        let requiredChanges = 0;
        for (let i = 0; i < commonKeys.length; i++)
            if (this.almostEqual(o1[commonKeys[i]], o2[commonKeys[i]]) < 1) requiredChanges++;

        return 1 - (keysDifference / totalKeys) - (requiredChanges / commonKeys.length);
    }
}