// Documentation resource identities. Hardware specifications live in mo-hardware.
export type Product = {
  id: 'mo-62a' | 'mo-68a';
  name: string;
  resourcesUrl: string;
  githubUrl: string | null;
  datasheetUrl: string | null;
};

export const products: Product[] = [
  {id: 'mo-62a', name: 'Mo 62A', githubUrl: 'https://github.com/inhandnet/Mo62A', datasheetUrl: null,
    resourcesUrl: 'https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO62A'},
  {id: 'mo-68a', name: 'Mo 68A', githubUrl: null, datasheetUrl: null,
    resourcesUrl: 'https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO68A'},
];
export const getProduct = (id: Product['id']) => products.find(p => p.id === id)!;
