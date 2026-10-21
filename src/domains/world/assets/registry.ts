import {createUrbanBuilding} from './buildings/urban';
import {createStreetLamp} from './furniture/streetLamp';
import {createRestaurant,createMall} from './buildings/commercial';
import {createStreetSign} from './signage/streetSign';
import {createStoreyedBuilding} from './buildings/storeyed';
import { createFootprintBuilding, createMissionHub } from "./buildings/footprint";
import type { AssetContext } from "./core/context";
import type { AssetInstance } from "./core/asset";
import { createHouse, createVenue, createStall, createWaterTank, createSolarPanels, } from "./buildings";
import { createTree, createPalm, createPlantingBed } from "./vegetation";
import { createBench, createPlanter, createLegacySeat, createBollard, } from "./furniture";
import { createSlab, createRoad, createRamp, createCourtyard } from "./streets";
import { createBoardwalk, createPier, createPergola } from "./structures";
import { createCanoe, createShuttle } from "./vehicles";
import { createDirectionSign, createNotice } from "./signage";
export const factories = {
    urban:createUrbanBuilding, streetLamp:createStreetLamp,
    restaurant:createRestaurant, mall:createMall, streetSign:createStreetSign,
    storeyed: createStoreyedBuilding,
    footprint: createFootprintBuilding,
    missionHub: createMissionHub,
    house: createHouse,
    venue: createVenue,
    stall: createStall,
    tank: createWaterTank,
    solar: createSolarPanels,
    tree: createTree,
    palm: createPalm,
    bed: createPlantingBed,
    bench: createBench,
    planter: createPlanter,
    seat: createLegacySeat,
    bollard: createBollard,
    slab: createSlab,
    road: createRoad,
    ramp: createRamp,
    courtyard: createCourtyard,
    boardwalk: createBoardwalk,
    pier: createPier,
    pergola: createPergola,
    canoe: createCanoe,
    shuttle: createShuttle,
    sign: createDirectionSign,
    notice: createNotice,
};
export type AssetSpec = {
    [K in keyof typeof factories]: {
        kind: K;
    } & Parameters<(typeof factories)[K]>[1];
}[keyof typeof factories];
export function instantiate(ctx: AssetContext, spec: AssetSpec): AssetInstance {
    switch (spec.kind) {
        case "urban": return factories.urban(ctx,spec);
        case "streetLamp": return factories.streetLamp(ctx,spec);
        case "restaurant": return factories.restaurant(ctx,spec);
        case "mall": return factories.mall(ctx,spec);
        case "streetSign": return factories.streetSign(ctx,spec);
        case "storeyed": return factories.storeyed(ctx,spec);
        case "footprint": return factories.footprint(ctx, spec);
        case "missionHub": return factories.missionHub(ctx, spec);
        case "house":
            return factories.house(ctx, spec);
        case "venue":
            return factories.venue(ctx, spec);
        case "stall":
            return factories.stall(ctx, spec);
        case "tank":
            return factories.tank(ctx, spec);
        case "solar":
            return factories.solar(ctx, spec);
        case "tree":
            return factories.tree(ctx, spec);
        case "palm":
            return factories.palm(ctx, spec);
        case "bed":
            return factories.bed(ctx, spec);
        case "bench":
            return factories.bench(ctx, spec);
        case "planter":
            return factories.planter(ctx, spec);
        case "seat":
            return factories.seat(ctx, spec);
        case "bollard":
            return factories.bollard(ctx, spec);
        case "slab":
            return factories.slab(ctx, spec);
        case "road":
            return factories.road(ctx, spec);
        case "ramp":
            return factories.ramp(ctx, spec);
        case "courtyard":
            return factories.courtyard(ctx, spec);
        case "boardwalk":
            return factories.boardwalk(ctx, spec);
        case "pier":
            return factories.pier(ctx, spec);
        case "pergola":
            return factories.pergola(ctx, spec);
        case "canoe":
            return factories.canoe(ctx, spec);
        case "shuttle":
            return factories.shuttle(ctx, spec);
        case "sign":
            return factories.sign(ctx, spec);
        case "notice":
            return factories.notice(ctx, spec);
    }
}
