import fs from "node:fs"

const input = fs.readFileSync("./input.txt").toString()
const MAX_SECRETS_TO_GENERATE = 2000


class SecretNumber extends Number {
  mix(valueToMix: number) {
    // unsign the mix operation
    // https://www.reddit.com/r/learnprogramming/comments/ufiulo/comment/i6tv6vj/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
    /**
     * let s1 = parseInt("01111100000110011110000101011111", 2)
      undefined
      let s2 = parseInt("10111110000011001111000010101111", 2)
      undefined
      s1 ^ s2
      -1038806544
      (s1 ^ s2) >>> 0
      3256160752
     */
    return new SecretNumber((this.valueOf() ^ valueToMix)>>>0)
  }

  prune() {
    return new SecretNumber(this.valueOf() % 16777216)
  }


  evolve(): SecretNumber {
    const currentValue = this.valueOf()

    const stepOne = this.evolutionStepOne(currentValue)
    const stepTwo = this.evolutionStepTwo(stepOne.valueOf())
    const stepThree = this.evolutionStepThree(stepTwo.valueOf())

    return stepThree
  }

  evolutionStepOne(currentValue: number): SecretNumber {
    const mul = currentValue * 64
    const mixed = new SecretNumber(currentValue).mix(mul)
    const pruned = mixed.prune()
    return pruned
  }

  evolutionStepTwo(currentValue: number): SecretNumber {
    const div = Math.floor(currentValue / 32)
    const mixed = new SecretNumber(currentValue).mix(div)
    const pruned = mixed.prune()
    return pruned
  }

  evolutionStepThree(currentValue: number): SecretNumber {
    const mul = currentValue * 2048
    const mixed = new SecretNumber(currentValue).mix(mul)
    const pruned = mixed.prune()
    return pruned
  }
}


class SecretNumberCache extends Map<string, SecretNumber> {
  addToCache(input: SecretNumber, result: SecretNumber, action: "prune" | "mix") {
    const cacheKey = `${action}:${input.valueOf()}`

    // TODO: check if it's in cache first
    // we've already cached this result?
    // DESIGN DECISION: it doesn't matter if we've cached the result. If we decide to explicitly
    // add to the cache, it's not the cache's responsibility to decide whether or not
    // to add the object in the end

    this.set(cacheKey, result)
  }
}

const generatedNumbers = []

for (const inputRow of input.split("\n")) {
  let currentValue = new SecretNumber(inputRow)

  for (let i = 0; i < MAX_SECRETS_TO_GENERATE; i++) {
    const generatedNum = currentValue.evolve()

    // generatedNumbers.push(generatedNum.valueOf())

    currentValue = generatedNum
  }
  generatedNumbers.push(currentValue.valueOf())
}

console.log(generatedNumbers.reduce((prev, curr) => prev += curr))



