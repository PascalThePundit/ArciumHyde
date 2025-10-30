export const performMPCAddition = async (inputs: number[]): Promise<number> => {
  console.log('Performing MPC Addition with inputs:', inputs);
  return new Promise(resolve => {
    setTimeout(() => {
      const sum = inputs.reduce((acc, val) => acc + val, 0);
      resolve(sum);
    }, 2000);
  });
};

export const performMPCMultiplication = async (inputs: number[]): Promise<number> => {
  console.log('Performing MPC Multiplication with inputs:', inputs);
  return new Promise(resolve => {
    setTimeout(() => {
      const product = inputs.reduce((acc, val) => acc * val, 1);
      resolve(product);
    }, 2000);
  });
};
