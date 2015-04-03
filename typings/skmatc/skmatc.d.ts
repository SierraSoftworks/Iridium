declare module "skmatc" {
    export = Skmatc;
}

declare class Skmatc {
    constructor(schema: any);

    static validators: [SkmatcCore.IValidator];
    static Validator: SkmatcCore.IValidatorStatic;
    static Result: SkmatcCore.IResultStatic;
    static Failure: SkmatcCore.IFailureStatic;
    static create(handles: (schema: any) => boolean, validate: (schema: any, data: any, path: string) => SkmatcCore.IResult, options?: any): SkmatcCore.IValidator;
    static validate(validators: [SkmatcCore.IValidator], schema: any, data: any, path?: string): SkmatcCore.IResult;
    static register(validator: SkmatcCore.IValidator);

    schema: any;
    validators: [SkmatcCore.IValidator];
    validate(data: any, path?: string): SkmatcCore.IResult;
    register(validator: SkmatcCore.IValidator);
}

declare module SkmatcCore {
    interface IValidatorStatic {
        (skmatc: Skmatc, options?: any): IValidator;
        create(handles: (schema: any) => boolean, validate: (schema: any, data: any, path: string) => IResult, options?: any): IValidator;
        module(handles: (schema: any) => boolean, validate: (schema: any, data: any, path: string) => IResult, options?: any): IValidator;
    }

    interface IValidator {
        name: string;
        skmatc: Skmatc;
        handles(schema: any): boolean;
        validate(schema: any, data: any, path: string): IResult;
        assert(schema: any, data: any, path: string, test: boolean, message?: string): IResult;
        fail(schema: any, data: any, path: string, message?: string): IResult;
    }

    interface IResultStatic {
        (failures: [IFailure]): IResult;
        compound(results: [IResult]): IResult;
    }

    interface IResult {
        failures: [IFailure];
        success: boolean;
        failed: boolean;
        message: string;
        messages: [string];
        error: Error;
    }

    interface IFailureStatic {
        (validator: IValidator, schema: any, data: any, path: string, message?: string): IFailure;
    }

    interface IFailure {
        validator: IValidator;
        schema: any;
        data: any;
        path: string;
        message: string;
    }

    interface IValidationHandler {
        (thisArg: {
            validator: IValidationHandler;
            skmatc: Skmatc;
            fail(message?: string);
            assert(test: boolean, message?: string);
        }, schema: any, data: any, path: string): IResult;
    }
}