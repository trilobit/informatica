/**
 * Класс управления приложением
 */
class Application {
    /**
     * Конструктор
     * Инициализация констант, параметров приложени и загрузка спрайтов
     */
    constructor() {
        // Ширина контейнера анимации
        this.WIDTH = 800;

        // Высока контейнера анимации
        this.HEIGHT = 600;

        // Рамка вокруг контейнера
        this.PADDING = 25;

        // Ускорение свободного падения
        this.GRAVITY = 9.81;

        // Константа масштаба: количество пикселей экрана на 1 метр
        this.SCALE = 100;

        // настройки по умолчанию
        this.DEFAULTS = {
            speed: 10,
            y0: 0,
            x0: 0,
            angle: 65,
        };

        this.sprite = null;
        this.startTime = 0;

        this.angle = 0;
        this.speed = 0;
        this.x0 = 0;
        this.y0 = 0;

        PIXI.loader
            .add('ball', 'img/ball.png')
            .load(() => {
                this.setup();
            });
    }

    /**
     * Основной цикл работы программы
     */
    run() {
        let type = "WebGL";
        if (!PIXI.utils.isWebGLSupported()) {
            type = "canvas";
        }

        PIXI.utils.sayHello(type);

        this.addListeners();
    }

    /**
     * Создает сцену приложения
     */
    makeScene() {
        //Create a Pixi Application
        this.pixi = new PIXI.Application({
                width: this.WIDTH + 2 * this.PADDING,
                height: this.HEIGHT + 2 * this.PADDING,
                antialias: true,
                transparent: false,
                resolution: 1,
            }
        );

        this.spriteContainer = new PIXI.Container();
        this.trajectContainer = new PIXI.Container();
        this.coordContainer = new PIXI.Container();

        this.pixi.stage.addChild(this.coordContainer);
        this.pixi.stage.addChild(this.trajectContainer);
        this.pixi.stage.addChild(this.spriteContainer);

        //Add the canvas that Pixi automatically created for you to the HTML document
        document.getElementById('view').appendChild(this.pixi.view);
    }

    addCoords() {
        const line = new PIXI.Graphics();
        line.lineStyle(2, 0xFFFFFF, 1);

        line.moveTo(this.getXPosByX(0), this.getYPosByY(0));
        line.lineTo(this.getXPosByX(0), this.PADDING);

        line.moveTo(this.getXPosByX(0), this.getYPosByY(0));
        line.lineTo(this.WIDTH + this.PADDING, this.getYPosByY(0));

        this.coordContainer.addChild(line);

        for (let i = 0; i < (this.WIDTH / this.SCALE) | 0; i++) {
            line.moveTo(this.getXPosByX(i), this.getYPosByY(0));
            line.lineTo(this.getXPosByX(i), this.getYPosByY(0) + 10);
        }

        for (let i = 0; i < (this.HEIGHT / this.SCALE) | 0; i++) {
            line.moveTo(this.getXPosByX(0), this.getYPosByY(i));
            line.lineTo(this.getXPosByX(0) - 10, this.getYPosByY(i));
        }
    }

    /**
     * Добавляем слушателей для обработки кнопок приложения
     */
    addListeners() {
        const inputs = document.getElementsByTagName('input');
        for (let idx in inputs){
            if (!inputs.hasOwnProperty(idx)) {
                continue;
            }
            inputs[idx].addEventListener('blur', () => {
                this.initParams();
            });
        }

        document.getElementById('play').addEventListener('click', () => {
            this.initParams();
            this.state = this.play;
        });

        document.getElementById('clear').addEventListener('click', () => {
            this.trajectContainer.removeChildren();
            this.resetParams();
            this.initParams();
        });
    }

    /**
     * Инициализация графического движка
     */
    setup() {
        this.makeScene();

        this.sprite = new PIXI.Sprite(
            PIXI.loader.resources['ball'].texture
        );

        this.sprite.scale.set(1/8, 1/8);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(this.getXPosByX(0), this.getYPosByY(0));
        this.spriteContainer.addChild(this.sprite);

        const style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 16,
            fill: "white",
            stroke: '#ff3300',
            strokeThickness: 2,
        });
        this.info = new PIXI.Text('', style);
        this.spriteContainer.addChild(this.info);

        this.trajectory = new PIXI.Graphics();
        this.trajectory.lineStyle(4, 0xFFFFFF, 1);
        this.trajectContainer.addChild(this.trajectory);

        this.state = this.wait;

        this.addCoords();
        this.resetParams();
        this.initParams();

        this.pixi.ticker.add(delta => gameLoop(delta));
        const gameLoop = (delta) => {
            this.state(delta);
        };
    }

    /**
     * Получение параметров приложения из пользовательских данных
     */
    initParams() {
        this.angle = parseFloat(document.getElementById('angle').value);
        this.speed = parseFloat(document.getElementById('speed').value);
        this.x0 = parseFloat(document.getElementById('x0').value);
        this.y0 = parseFloat(document.getElementById('y0').value);

        this.totalTime = this.calculateTotalTime();

        this.sprite.position.set(this.getXPosByX(this.x0), this.getYPosByY(this.y0));
        this.startTime = Date.now();

        this.updateInfo(0,this.x0, this.y0);
    }

    /**
     * Возвращает настройки к значениям по умолчанию
     */
    resetParams() {
        document.getElementById('angle').value = this.DEFAULTS['angle'];
        document.getElementById('speed').value = this.DEFAULTS['speed'];
        document.getElementById('x0').value = this.DEFAULTS['x0'];
        document.getElementById('y0').value = this.DEFAULTS['y0'];
    }

    /**
     * Анимация опыта
     * @param delta
     */
    play(delta) {
        let t = (Date.now() - this.startTime) / 1000;

        if (t > this.totalTime) {
            t = this.totalTime;
            this.state = this.wait;
        }

        const x = this.x0 + this.speed * t * Math.cos(this.angle * Math.PI / 180);
        const y = this.y0 + this.speed * t * Math.sin(this.angle * Math.PI / 180) - this.GRAVITY * t * t / 2;

        const xpos = this.getXPosByX(x);
        const ypos = this.getYPosByY(y);

        if (y < 0) {
            this.state = this.wait;
        }

        const line = new PIXI.Graphics();
        line.lineStyle(4, 0xFFFFFF, 1);
        line.moveTo(this.sprite.x, this.sprite.y);
        line.lineTo(xpos, ypos);

        this.trajectContainer.addChild(line);

        this.sprite.position.set(xpos, ypos);

        this.updateInfo(t, x, y);
    }

    /**
     * Ожидание действий пользователя
     * @param delta
     */
    wait(delta) {

    }

    /**
     * Преобразует Y координату в координату на экране
     * @param y
     * @returns {number}
     */
    getYPosByY(y) {
        return this.HEIGHT + this.PADDING - this.SCALE * y;
    }

    /**
     * Преобразует X координату в координату на экране
     * @param x
     * @returns {number}
     */
    getXPosByX(x) {
        return this.PADDING + this.SCALE * x;
    }

    /**
     * Возвращает время до падения тела
     * @returns {number}
     */
    calculateTotalTime() {
        const v0y = this.speed * Math.sin(this.angle * Math.PI / 180);
        return (v0y + Math.sqrt(v0y * v0y + 2 * this.GRAVITY * this.y0)) / this.GRAVITY;
    }

    updateInfo(dt, dx, dy) {
        this.info.text =
             "Δt = " + dt.toFixed(2) +
            "\nx = " + dx.toFixed(2) +
            "\ny = " + dy.toFixed(2);
        let x = this.sprite.position.x + 15;
        let y = this.sprite.position.y - 70;
        if (y < this.PADDING) {
            y = this.PADDING;
        }
        if (x > this.WIDTH + this.PADDING - 70) {
            x = this.WIDTH + this.PADDING - 70
        }
        this.info.position.set(x, y);
    }
}
