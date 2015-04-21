declare module 'concoction' {
    export = concoction;
}

declare class concoction {
    /**
     * Creates a new recipe with the given ingredients
     * @param {Concoction.Ingredient} ingredients The ingredients which compose the recipe
     */
    constructor(ingredients: Concoction.Ingredient[]);

    static Ingredient: Concoction.IngredientStatic;

    static Convert: Concoction.ConvertStatic;
    static Rename: Concoction.RenameStatic;

    /**
     * The ingredients which make up the recipe
     * @property {Array<Concoction.Ingredient>} ingredients The ingredients which make up the recipe
     */
    ingredients: Concoction.Ingredient[];

    /**
     * Applies the recipie to the given object
     * @param {any} object The object to apply the recipie to
     */
    apply(object: any);

    /**
     * Reverses the application of a recipie on the given object
     * @param {any} object The object to apply the recipie to
     */
    reverse(object: any);
}

declare module Concoction {
    export interface IngredientStatic {
        /**
         * Creates a new ingredient which transforms objects as part of a recipe
         */
        (): Ingredient;
    }

    export interface Ingredient {
        /**
         * Applies the ingredient's transformation to the given object
         * @param object The object to apply the transformation to
         */
        apply(object: any);

        /**
         * Reverses the application of the ingredient's transformation to the given object
         * @param object The object to apply the transformation to
         */
        reverse(object: any);
    }

    export interface RenameStatic {
        /**
         * Creates an ingredient which renames an object's properties
         * @param {Object} mapping A map from the original object names to the names you wish to use
         */
        new(mapping: { [key: string]: string }) : Ingredient;
    }

    export interface ConvertStatic {
        /**
         * Creates an ingredient which converts an object's properties from one form to another
         * @param {Object} mapping A map of object properties to their conversion functions
         */
        new(mapping: { [key: string]: Ingredient }): Ingredient;
    }
}