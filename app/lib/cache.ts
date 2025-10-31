

class SimpleCache {
    private cache: Map<string, { data: any; expiry: number} > = new Map();

    set(key: string,data: any, ttl: number = 300000) { //5 minutes default
        this.cache.set(key,{
            data,
            expiry: Date.now() + ttl
        })

    }

    get(key:string): any {
        const item = this.cache.get(key);
        if(!item) return null;

        if(Date.now() > item.expiry){
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear() : void {
        this.cache.clear();
    }
}

export const cache = new SimpleCache();