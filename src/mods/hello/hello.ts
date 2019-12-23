class HelloService {
  names: string[];

  constructor() {
    this.names = [];
  }

  create(data: any, params: any) {
    const name: string = data.name;
    this.names.push(name);
    return Promise.resolve(this.helloTo(name));

  }

  find(params) {
    return Promise.resolve(this.names.map(this.helloTo));
  }

  helloTo(name: string) {
    return `Hello, ${name}!`;
  }

}

export default HelloService;
