import { Injectable } from "@nestjs/common";

type OrderConfigCache = {
    businessLocationId: number;
    isTakewayEnabled: boolean;
    isDeliveryEnabled: boolean;
};

@Injectable()
export class OrderConfigCacheService {
    private cache = new Map<number, OrderConfigCache>();

    get(businessLocationId: number) {
        return this.cache.get(businessLocationId);
    }

    set(config: any) {
        this.cache.set(config.businessLocationId, config);
    }

    delete(businessLocationId: number) {
        this.cache.delete(businessLocationId);
    }

    clear() {
        this.cache.clear();
    }
}
