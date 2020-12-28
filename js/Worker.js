



class TrainingWorker extends EventEmitter {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.methods = new Map();
        this.querys = new Map();
        this.ids = 0;
        this.ctx.addEventListener('message', (e) => this.onMessage(e));
    }

    call(cmd, payload) {
        const id = this.ids++;
        return new Promise((resolve, reject) => {
            this.querys.set(id, [resolve, reject]);

            this.ctx.postMessage(JSON.stringify({
                cmd,
                payload,
                id
            }));
        })
    }
    onResponce(data) {


        if (this.querys.get(data.id)) {
            const [resolve, reject] = this.querys.get(data.id);
            this.querys.delete(data.id);

            if (data.isError) reject(data.payload)
            else resolve(data.payload)

        }
    }

    sendResponce(data, payload, isError) {
        const id = data.id;
        this.ctx.postMessage(JSON.stringify({
            cmd: 'responce',
            payload,
            isError,
            id
        }));
    }

    async onMessage(e) {
        const data = JSON.parse(e.data);
        
        const cmd = data.cmd;
        const id = data.id
        if (cmd == 'responce')
            return this.onResponce(data);

        const fn = this.methods.get(cmd);

        if (fn) {
            try {
                const result = await fn(data.payload);
                this.sendResponce(data, result, false);
            } catch ({ message, stack }) {
                this.sendResponce(data, { message, stack }, true);
            }
        } else {
            this.sendResponce(data, { message: 'not found' }, true);
        }
    }

    method(cmd, fn) {
        this.methods.set(cmd, fn);
    }
}