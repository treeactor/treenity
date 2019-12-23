export function f(target, propertyKey: string): any {
  let x;

  function inner(target, propertyKey: string) {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    const paramTypes = Reflect.getMetadata('design:properties', target, propertyKey);
    // return is(target, propertyKey);
  }

  if (target.constructor) {
    return inner(target, propertyKey);
  } else {
    return inner;
  }
}

interface PresentationOptions<PropertyType> {
  required?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  displayName?: string;
  tableDisplay?: boolean;
  columnWidth?: number;
  defaultValue?: PropertyType;
}

type PropertyPresentationMap<T> = {
  [P in keyof T]?: PresentationOptions<T[P]>;
};
const presentableProperties = [];
const PROPERTY_PRESENTATION_KEY = Symbol('propertyPresentation');

export function definePresentation<T>(klass: new (...args: any[]) => T, props: PropertyPresentationMap<T>): void {
  for (let propertyName in props) {
    if (props.hasOwnProperty(propertyName)) {
      presentableProperties.push(propertyName);
      Reflect.defineMetadata(PROPERTY_PRESENTATION_KEY, props[propertyName], klass.prototype, propertyName);
    }
  }
}
