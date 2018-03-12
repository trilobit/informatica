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
        this.WIDTH = 1024;

        // Высока контейнера анимации
        this.HEIGHT = 512;

        // Ускорение свободного падения
        this.GRAVITY = 9.81;

        // Константа масштаба: количество пикселей экрана на 1 метр
        this.SCALE = 128;

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
                width: this.WIDTH,
                height: this.HEIGHT,
                antialias: true,
                transparent: false,
                resolution: 1,
            }
        );

        this.spriteContainer = new PIXI.Container();
        this.trajectContainer = new PIXI.Container();

        this.pixi.stage.addChild(this.trajectContainer);
        this.pixi.stage.addChild(this.spriteContainer);

        this.spriteContainer.addChild(this.sprite);

        this.pixi.ticker.add(delta => gameLoop(delta));

        const gameLoop = (delta) => {
            this.state(delta);
        };

        //Add the canvas that Pixi automatically created for you to the HTML document
        document.getElementById('view').appendChild(this.pixi.view);
    }

    /**
     * Добавляем слушателей для обработки кнопок приложения
     */
    addListeners() {
        document.getElementById('play').addEventListener('click', () => {
            this.initParams();
            this.state = this.play;
        });

        document.getElementById('clear').addEventListener('click', () => {
            this.trajectContainer.removeChildren();
        });
    }

    /**
     * Инициализация графического движка
     */
    setup() {
        this.sprite = new PIXI.Sprite(
            PIXI.loader.resources['ball'].texture
        );

        this.sprite.scale.set(1/8, 1/8);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(this.getXPosByX(0), this.getYPosByY(0));

        this.state = this.wait;

        this.makeScene();
        this.initParams();
    }

    /**
     * Получение параметров приложения из пользовательских данных
     */
    initParams() {
        this.angle = parseFloat(document.getElementById('angle').value);
        this.speed = parseFloat(document.getElementById('speed').value);
        this.x0 = parseFloat(document.getElementById('x0').value);
        this.y0 = parseFloat(document.getElementById('y0').value);

        this.sprite.position.set(this.getXPosByX(this.x0), this.getYPosByY(this.y0));
        this.startTime = Date.now();
    }

    /**
     * Анимация опыта
     * @param delta
     */
    play(delta) {
        const t = (Date.now() - this.startTime) / 1000;

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
        return this.HEIGHT - this.SCALE * y;
    }

    /**
     * Преобразует X координату в координату на экране
     * @param x
     * @returns {number}
     */
    getXPosByX(x) {
        return this.SCALE * x;
    }
}
