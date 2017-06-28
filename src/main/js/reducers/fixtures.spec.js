import fixtures from './fixtures'



describe('fixtures reducer', () => {
    it('should return the initial state', () => {
        expect(fixtures(undefined, {})).toEqual([])
    })

    it('should handle ADD_FIXTURE', () => {
        expect(
            fixtures([], {
                type: 'ADD_FIXTURE',
                payload: {
                    urn: 'some urn'
                }
            })
        ).toEqual([
            {
                urn: 'some urn'
            }
        ])

    })
})