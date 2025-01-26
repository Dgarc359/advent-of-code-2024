import * as fs from "node:fs";

type ComputerRegisters = {
  A: number;
  B: number;
  C: number;
};

const inputFile = fs.readFileSync("./input.txt").toString();
// we're making an assumption about file format right now, which is
// registers make up the first 3 lines in the file

// and a program starts on the 5th line. This is just a heuristic to get to the
// actual hard part of this problem, which is processing all the different
// instructions correctly

// making sure we're alawys reading the right things can be a fun exercise
// in regards to the file, but... I don't want to right now!

function parseRegisters(programFile: string): ComputerRegisters {
  const programRows = programFile.split("\n");
  const aRegisterString = programRows[0];
  const bRegisterString = programRows[1];
  const cRegisterString = programRows[2];

  const registers = [aRegisterString, bRegisterString, cRegisterString].map(
    (reg) => {
      const colonSplit = reg.split(":")[1].trim();
      return Number(colonSplit).valueOf();
    }
  );

  return {
    A: registers[0],
    B: registers[1],
    C: registers[2],
  };
}

const registers = parseRegisters(inputFile);

console.log("parsed registers");

function parseProgramInstructions(programFile: string): number[] {
  const instrString = programFile
    .split("\n")[4]
    .split(":")
    .splice(1, 1)
    .join("")
    .trim();

  const nums = instrString.split(",");

  return nums.map((el) => Number(el).valueOf());
}

const instructions = parseProgramInstructions(inputFile);

console.log("got instructions");

function getOpcodeAndOperand(nums: number[], instructionPointer: number) {
  if (
    instructionPointer >= nums.length ||
    instructionPointer + 1 >= nums.length
  ) {
    throw new Error("HALTING ERROR");
  }
  return [nums[instructionPointer], nums[instructionPointer + 1]];
}

// outputs will only be created by `out` instruction
const outputs: number[] = [];
readInstructions(instructions, 0);
console.log("read instructions");

// read instructions will get called by execute instructions after
// it has determined what the next steps are
// get opcode and operand will halt operation when we
// try reading from out of the array's bounds
function readInstructions(instructions: number[], instructionPointer: number) {
  try {
    const [opcode, operand] = getOpcodeAndOperand(
      instructions,
      instructionPointer
    );
    executeInstructions(opcode, operand, instructionPointer, instructions);
  } catch (e) {
    console.log("got halting error");
    return;
  }
}

function executeInstructions(
  opcode: number,
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  switch (opcode) {
    case 0: {
      advInstruction(operand, instructionPointer, instructions);
      break;
    }
    case 1: {
      bxlInstruction(operand, instructionPointer, instructions);
      break;
    }
    case 2: {
      bstInstruction(operand, instructionPointer, instructions);
      break;
    }
    case 3: {
      jnzInstruction(operand, instructionPointer, instructions);
      break;
    }
    case 4: {
      bxcInstruction(operand, instructionPointer, instructions);
      break;
    }
    case 5: {
      outInstruction(operand, instructionPointer, instructions);
      break;
    }
    case 6: {
      bdvInstruction(operand, instructionPointer, instructions);
      break;
    }
    case 7: {
      cdvInstruction(operand, instructionPointer, instructions);
      break;
    }
    default:
      throw new Error("????");
  }
}

function getComboOperand(n: number): number {
  switch (n) {
    case 0:
      return n;
    case 1:
      return n;
    case 2:
      return n;
    case 3:
      return n;
    case 4:
      return registers.A;
    case 5:
      return registers.B;
    case 6:
      return registers.C;
    default:
      return -1; // any other instruction should really never happen, accord to the spec
  }
}

// perform division
// numerator = value in register A
// denominator = 2 ^ combo operand
// result of division is truncated and written to register A
// calls read instructions with pointer + 2
function advInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  const numerator = registers.A;
  const denominator = Math.pow(2, getComboOperand(operand));
  const result = numerator / denominator;
  registers.A = Math.trunc(result);

  return readInstructions(instructions, instructionPointer + 2);
}

// calculate bitwise XOR of register B
// and literal operand
// store result in register b
// call read instr with pointer + 2
function bxlInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  const result = registers.B ^ operand;
  registers.B = result;
  return readInstructions(instructions, instructionPointer + 2);
}

// combo operand % 8
// write result to register b
// call read instr with pointer + 2
function bstInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  const result = getComboOperand(operand) % 8;
  registers.B = result;
  return readInstructions(instructions, instructionPointer + 2);
}

// if register A === 0; do nothing
// do nothing?
// does that mean just continue to next instr? instr pointer + 2?
// else set instr pointer to literal operand value
// if jump, dont increase instr pointer value
function jnzInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  if (registers.A === 0) {
    return readInstructions(instructions, instructionPointer + 2);
  } else {
    return readInstructions(instructions, operand);
  }
}

// result = register B XOR register C
// store result in register B
// call read instr with pointer + 2
function bxcInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  const result = registers.B ^ registers.C;
  registers.B = result;
  return readInstructions(instructions, instructionPointer + 2);
}

// combo operand % 8
// output result
// call read instr with pointer + 2
function outInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  const result = getComboOperand(operand) % 8;
  console.log(result);
  outputs.push(result);
  return readInstructions(instructions, instructionPointer + 2);
}

// just like adv
// except result is stored in C register
// (numerator still read from A register)

// modified adv:

// perform division
// numerator = value in register A
// denominator = 2 ^ combo operand
// result of division is truncated and written to register B
// calls read instructions with pointer + 2
function bdvInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  const numerator = registers.A;
  const denominator = Math.pow(2, getComboOperand(operand));
  const result = numerator / denominator;
  registers.B = result;
  return readInstructions(instructions, instructionPointer + 2);
}

// just like adv
// except result is stored in C register
// (numerator still read from A register)

// modified adv:

// perform division
// numerator = value in register A
// denominator = 2 ^ combo operand
// result of division is truncated and written to register C
// calls read instructions with pointer + 2
function cdvInstruction(
  operand: number,
  instructionPointer: number,
  instructions: number[]
) {
  const numerator = registers.A;
  const denominator = Math.pow(2, getComboOperand(operand));
  const result = numerator / denominator;
  registers.C = result;
  return readInstructions(instructions, instructionPointer + 2);
}

console.log(outputs.join(','));
