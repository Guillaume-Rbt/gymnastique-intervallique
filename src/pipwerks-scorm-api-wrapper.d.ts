declare module "pipwerks-scorm-api-wrapper" {
    export const SCORM: {
        init: () => boolean;
        get: (parameter: string) => string;
        set: (parameter: string, value: string) => boolean;
        save: () => boolean;
        quit: () => boolean;
        version: string;
    };
}
