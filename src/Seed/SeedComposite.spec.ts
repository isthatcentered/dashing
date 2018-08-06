import { Seed } from './Seed';
import { merge } from 'lodash';

jest.mock("lodash", () => ({ merge: jest.fn() }))

export class SeedComposite implements Seed {

    protected _items: Array<Seed> = []

    constructor(seeds: Array<Seed>) {
        this._items = [...seeds]
    }


    generate(): any[] {

        return this._items.reduce((acc, item) =>
            merge(acc, item.generate()),
            [])
    }

    merge(seed: Seed): Seed {
        return new SeedComposite([this, seed])
    }
}


describe(`SeedComposite`, () => {

    beforeEach(() => {
        (merge as jest.Mock).mockReset()
    })

    describe(`Instantiation`, () => {

        it(`Should accept an array of Seed`, () => {
            new SeedComposite([])
        })
    })

    describe(`generate()`, () => {

        it(`Should return the result of all passed seeds`, () => {

            const seed1 = makeSpySeed(),
                seed2 = makeSpySeed(),
                mergeResult = "I am the result of lodash's merge";

            (merge as jest.Mock).mockReturnValue(mergeResult)

            const composite = new SeedComposite([seed1, seed2])

            const result = composite.generate()

            expect(seed1.generate).toHaveBeenCalled()
            expect(seed2.generate).toHaveBeenCalled()
            expect(merge).toHaveBeenCalledWith(seed1.generate(), seed2.generate())
            expect(result).toBe(mergeResult)
        })
    })

    describe(`merge()`, () => {

        it(`Should return a new SeedComposite holding this and other seed`, () => {

            const composite = new SeedComposite([makeSpySeed(["robin", "joker"])]),
                spySeed = makeSpySeed(["batman"])

            const merged = composite.merge(spySeed)
            composite.generate = jest.fn()

            expect(merged).toBeInstanceOf(SeedComposite)
            expect(merge).not.toBe(composite)

            expect(spySeed.generate).not.toHaveBeenCalled()
            expect(composite.generate).not.toHaveBeenCalled()

            merged.generate();

            // if I call generate, original & new seed should have been called
            expect(spySeed.generate).toHaveBeenCalled()
            expect(composite.generate).toHaveBeenCalled()
        })
    })
})

function makeSpySeed(returns: any[] = []): Seed {

    return {
        generate: jest.fn().mockReturnValue(returns),
        merge: () => null as any
    }
}