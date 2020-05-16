import { Entity, Component } from "@hex-engine/2d";

export type ComponentType<f extends (...args: any[]) => any> = Entity & {rootComponent: ReturnType<f> & Component};

// type Class<T> = { new(...args: any[]): T; };

// // SFINAE in Typescript
// interface ComponentDefinitions<T, U extends ComponentDefinitions<T, U>> {
//   [key: string]: (this: T & {components: {[k in keyof U]: ReturnType<U[k]>}}, ...args: any[]) => any
// }

// interface ComponentDefinitions1<T, U extends {[key: string]: () => any}> {
//   [key: string]: (this: T & {components: {[k in keyof U]: ReturnType<U[k]>}}, ...args: any[]) => any
// }

// interface ComponentDefinitions2<T> {
//   [key: string]: (this: T & {components: any}, ...args: any[]) => any
// }

// export function Component<T, U extends ComponentDefinitions2<T> = {[key: string]: any}>({
//   components,
//   draw
// }: {components: U, draw?: any}) {
//   return (C) => {
//     return class Wrapped extends C {
//       constructor(...args: any[]) {
//         useType(C as any);

//         super(...args);

//         this.components = {};

//         for (const key of Object.keys(components ?? {})) {
//           this.components[key] = useNewComponent(components![key]);
//         }
//       }
//     } as Class<T & {components: any}> /*| {[k in keyof U]: ReturnType<U[k]>} */;
//   }
// }
