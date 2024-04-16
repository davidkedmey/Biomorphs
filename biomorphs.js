class Biomorph {
    constructor(canvas, genes = null, config = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config || this.defaultConfig();
        this.genes = genes || this.randomizeGenes();
        this.draw();
    }

    defaultConfig() {
        return {
            useSegmentation: false,
            useAsymmetry: false,
            useBranchingFactor: false,
            useColor: true,
            useDepth: true,
            useAngleVariation: true,
            useLengthVariation: true,
            useGradientEffect: false,
            useAlternateSegmentAsymmetry: false,
        };
    }

    randomizeGenes() {
        return Array.from({ length: 14 }, () => Math.floor(Math.random() * 21));
    }

    mutateGenes() {
        const geneToMutate = Math.floor(Math.random() * this.genes.length);
        this.genes[geneToMutate] = Math.floor(Math.random() * 21);
        this.draw();
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const r = this.config.useColor ? Math.floor((this.genes[7] / 20) * 255) : 0;
        const g = this.config.useColor ? Math.floor((this.genes[8] / 20) * 255) : 0;
        const b = this.config.useColor ? Math.floor((this.genes[9] / 20) * 255) : 0;
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;

        if (this.config.useSegmentation) {
            this.drawWithSegmentation(ctx);
        } else {
            this.drawStandard(ctx, this.canvas.width / 2, this.canvas.height - 10);
        }
    }

    drawWithSegmentation(ctx) {
        const segmentCount = this.genes[12] % 5 + 1;
        const segmentSpacing = this.genes[13] % 20 + 20;

        let gradientFactor = 1;
        for (let i = 0; i < segmentCount; i++) {
            const segmentY = this.canvas.height - 10 - i * segmentSpacing;
            if (this.config.useAlternateSegmentAsymmetry) {
                gradientFactor = i % 2 === 0 ? gradientFactor : 1 / gradientFactor;
            }
            this.drawStandard(ctx, this.canvas.width / 2, segmentY, undefined, undefined, gradientFactor);
            gradientFactor *= this.config.useGradientEffect ? 1 + (this.genes[10] / 20) : 1;
        }
    }

    drawStandard(ctx, xStart, yStart, customDepth = null, customLength = null, gradientFactor = 1) {
        const depth = customDepth || this.genes[0] % 4 + 3;
        const angleVariation = customLength || (this.genes[1] / 20) * Math.PI * gradientFactor;
        const length = this.genes[2] % this.canvas.height / 10 + 20;

        this.drawBranch(ctx, xStart, yStart, length, -Math.PI / 2, depth, angleVariation, true);
    }

    drawBranch(ctx, x, y, length, angle, depth, angleVariation, isRoot) {
        if (depth === 0) return;

        const xEnd = x + Math.cos(angle) * length;
        const yEnd = y + Math.sin(angle) * length;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();

        if (depth <= 1) return;

        const branches = isRoot || !this.config.useBranchingFactor ? 1 : 2 + this.genes[3] % 3;
        const angleIncrement = branches > 1 ? angleVariation / (branches - 1) : 0;

        for (let i = 0; i < branches; i++) {
            let newAngle = angle - angleVariation / 2 + angleIncrement * i;
            if (!isRoot && this.config.useAsymmetry) {
                const asymmetry = this.genes[10 + depth % 3] % 2 === 0 ? -0.5 : 0.5;
                newAngle += asymmetry * (angleVariation / 4);
            }
            this.drawBranch(ctx, xEnd, yEnd, length * 0.7, newAngle, depth - 1, angleVariation / 2, false);
        }
    }
}
// ... Rest of the document ready logic including generateChildren and getConfigFromUI ...

document.addEventListener('DOMContentLoaded', () => {
    // ... unchanged initialization and setup logic ...

    // Apply button logic
    document.getElementById('applyConfig').addEventListener('click', () => {
        const newConfig = getConfigFromUI();
        parentBiomorph = new Biomorph(parentCanvas, null, newConfig);
        generateChildren();
    });

    // Randomize button logic
    document.getElementById('randomize').addEventListener('click', () => {
        parentBiomorph = new Biomorph(parentCanvas, null, parentBiomorph.config);
        generateChildren();
    });

    // Initial setup
    let parentBiomorph = new Biomorph(parentCanvas, null, getConfigFromUI());
    generateChildren();
});

document.addEventListener('DOMContentLoaded', () => {
    const parentCanvas = document.getElementById('parentCanvas');
    const childrenContainer = document.getElementById('childrenContainer');
    
    function getConfigFromUI() {
        return {
            useSegmentation: document.getElementById('useSegmentation').checked,
            useAsymmetry: document.getElementById('useAsymmetry').checked,
            useBranchingFactor: document.getElementById('useBranchingFactor').checked,
            useColor: document.getElementById('useColor').checked,
            useDepth: document.getElementById('useDepth').checked,
            useAngleVariation: document.getElementById('useAngleVariation').checked,
            useLengthVariation: document.getElementById('useLengthVariation').checked,
            useGradientEffect: document.getElementById('useGradientEffect').checked,
            useAlternateSegmentAsymmetry: document.getElementById('useAlternateSegmentAsymmetry').checked,
        };
    }

    function generateChildren() {
        childrenContainer.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const childCanvas = document.createElement('canvas');
            childCanvas.width = 100;
            childCanvas.height = 100;
            childrenContainer.appendChild(childCanvas);
            const childBiomorph = new Biomorph(childCanvas, parentBiomorph.genes.slice(), parentBiomorph.config);
            childBiomorph.mutateGenes();
            childCanvas.addEventListener('click', () => {
                parentBiomorph = new Biomorph(parentCanvas, childBiomorph.genes, parentBiomorph.config);
                generateChildren();
            });
        }
    }

    let parentBiomorph = new Biomorph(parentCanvas, null, getConfigFromUI());
    generateChildren();

    document.getElementById('applyConfig').addEventListener('click', () => {
        parentBiomorph = new Biomorph(parentCanvas, null, getConfigFromUI());
        generateChildren();
    });

    document.getElementById('randomize').addEventListener('click', () => {
        parentBiomorph = new Biomorph(parentCanvas, null, getConfigFromUI());
        generateChildren();
    });
});
