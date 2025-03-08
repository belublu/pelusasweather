// spinner.js
(function() { // IIFE para encapsular

    // Versión más moderna y limpia del código de Spin.js (minificada y ES6+)
    const defaults = { lines: 12, length: 7, width: 5, radius: 10, scale: 1, corners: 1, color: '#000', fadeColor: 'transparent', animation: 'spinner-line-fade-default', rotate: 0, direction: 1, speed: 1, zIndex: 2e9, className: 'spinner', top: '50%', left: '50%', shadow: '0 0 1px transparent', position: 'absolute' };
    const Spinner = class {
        constructor(opts = {}) { this.opts = { ...defaults, ...opts }; }
        spin(target) {
            this.stop();
            this.el = document.createElement('div');
            this.el.className = this.opts.className;
            this.el.setAttribute('role', 'progressbar');
            Object.assign(this.el.style, { position: this.opts.position, width: '0', zIndex: this.opts.zIndex.toString(), left: this.opts.left, top: this.opts.top, transform: `scale(${this.opts.scale})` });
            target?.insertBefore(this.el, target.firstChild || null);
            drawLines(this.el, this.opts);
            return this;
        }
        stop() { this.el?.parentNode?.removeChild(this.el); this.el = undefined; return this; }
    };
    const getColor = (color, idx) => typeof color == 'string' ? color : color[idx % color.length];
    const drawLines = (el, opts) => {
        const borderRadius = `${Math.round(opts.corners * opts.width * 500) / 1000}px`;
        const shadow = opts.shadow === true ? '0 2px 4px #000' : typeof opts.shadow === 'string' ? opts.shadow : 'none';
        const shadows = parseBoxShadow(shadow);
        for (let i = 0; i < opts.lines; i++) {
            const degrees = ~~(360 / opts.lines * i + opts.rotate);
            const backgroundLine = document.createElement('div');
            Object.assign(backgroundLine.style, { position: 'absolute', top: `${-opts.width / 2}px`, width: `${opts.length + opts.width}px`, height: `${opts.width}px`, background: getColor(opts.fadeColor, i), borderRadius, transformOrigin: 'left', transform: `rotate(${degrees}deg) translateX(${opts.radius}px)` });
            const delay = i * opts.direction / opts.lines / opts.speed - 1 / opts.speed;
            const line = document.createElement('div');
            Object.assign(line.style, { width: '100%', height: '100%', background: getColor(opts.color, i), borderRadius, boxShadow: normalizeShadow(shadows, degrees), animation: `${1 / opts.speed}s linear ${delay}s infinite ${opts.animation}` });
            backgroundLine.appendChild(line);
            el.appendChild(backgroundLine);
        }
    };
    const parseBoxShadow = (boxShadow) => {
        const regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
        const shadows = [];
        for (const shadow of boxShadow.split(',')) {
            const matches = shadow.match(regex);
            if (matches === null) continue;
            let [, , x, , xUnits, , y, , yUnits, end] = matches;
            x = +x;
            y = +y;
            if (x === 0 && !xUnits) xUnits = yUnits;
            if (y === 0 && !yUnits) yUnits = xUnits;
            if (xUnits !== yUnits) continue;
            shadows.push({ prefix: matches[1] || '', x, y, xUnits, yUnits, end: matches[8] });
        }
        return shadows;
    };
    const normalizeShadow = (shadows, degrees) => shadows.map(shadow => {
        const [x, y] = convertOffset(shadow.x, shadow.y, degrees);
        return `${shadow.prefix}${x}${shadow.xUnits} ${y}${shadow.yUnits}${shadow.end}`;
    }).join(', ');
    const convertOffset = (x, y, degrees) => {
        const radians = degrees * Math.PI / 180;
        return [Math.round((x * Math.cos(radians) + y * Math.sin(radians)) * 1000) / 1000, Math.round((-x * Math.sin(radians) + y * Math.cos(radians)) * 1000) / 1000];
    };

    // Exporta Spinner *correctamente* para que esté disponible globalmente
    window.Spinner = Spinner;

})();

// Define las opciones y la variable spinner *fuera* de la IIFE
let spinnerOpts = {
    lines: 13,
    length: 10,
    width: 5,
    radius: 15,
    color: "#ffff",
    speed: 0.5,
    trail: 60,
};
let spinner = null; // Declara la variable spinner