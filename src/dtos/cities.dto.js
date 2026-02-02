export const toCitiesResponseDto = (cities) => ({
    cities: cities.map((city) => ({
        id: city.id,
        name: city.name
    }))
});
