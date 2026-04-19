// Configure screen dimensions
namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 256
    export const ARCADE_SCREEN_HEIGHT = 240
}

// Custom sprite kinds
namespace SpriteKind {
    export const UI = SpriteKind.create()
}

// Enums
enum GameState {
    MainMenu
}

// Initialise variables

// Control
let gameState: number = null
let inputEnabled: boolean = true

// Color
let defaultPalette: color.Palette = color.hexArrayToPalette([
    0x000000,
    0xffffff,
    0xa40000,
    0xfc78fc,
    0xc84c0c,
    0x00a800,
    0x9290ff,
    0x800080,
    0x6b6d00,
    0xfc9838,
    0xe40058,
    0xfcbcb0,
    0x80d010,
    0xfcd8a8,
    0xca0c0c,
    0x000000
])

// Sounds
let menuSwitchGameSfx: music.SoundEffect = music.createSoundEffect(WaveShape.Triangle, 3365, 3365, 255, 44, 100, SoundExpressionEffect.None, InterpolationCurve.Linear)


// Main menu
let menuColorList: number[] = []
let gameIconSprites: Sprite[] = [null, null]
let gameIconImages: Image[][] = [[assets.image`DkGameUnselected`, assets.image`DkGameSelected`], [assets.image`Mario1GameUnselected`, assets.image`Mario1GameSelected`]]
let gameSelected: number = 0


// Main menu screen
function mainMenuIntro() {
    // Intro
    inputEnabled = false
    scene.setBackgroundImage(assets.image`IntroBg`)
    color.setPalette(color.Black)
    timer.background(function () {
        let count: number = 0
        menuColorList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].sort((a, b) => Math.random() - 0.5)
        menuColorList.forEach(function (c) {
            if (count > 5) {
                return
            }

            for (let i = 0; i < 256; i += 3) {
                color.setColor(c, color.rgb(i, i, i))
                pause(7)
            }
            for (let i = 255; i >= 0; i -= 3) {
                color.setColor(c, color.rgb(i, i, i))
                pause(7)
            }
            count += 1
        })

        color.startFadeFromCurrent(color.White)
        pause(200)
    })
    music.play(music.createSong(assets.song`MainMenuThemeIntro`), music.PlaybackMode.UntilDone)
}

function mainMenu() {
    gameState = GameState.MainMenu
    inputEnabled = true

    music.play(music.createSong(assets.song`MainMenuTheme`), music.PlaybackMode.LoopingInBackground)
    color.clearFadeEffect()

    // Main menu init
    scene.setBackgroundImage(assets.image`MainMenuBg`)

    let gameIcon: Sprite = sprites.create(gameIconImages[0][1], SpriteKind.UI)
    gameIcon.setPosition(76, 120)
    gameIconSprites[0] = gameIcon
    gameIcon = sprites.create(gameIconImages[1][0], SpriteKind.UI)
    gameIcon.setPosition(180, 120)
    gameIconSprites[1] = gameIcon

    color.startFade(color.White, defaultPalette)
    inputEnabled = true
}

function onAButtonPressed() {
    if (!inputEnabled) {
        return
    }
    
    if (gameState == GameState.MainMenu) {
        if (gameSelected == 0) {
            inputEnabled = false
            music.stopAllSounds()
            music.play(music.melodyPlayable(music.zapped), music.PlaybackMode.InBackground)
            color.startFadeFromCurrent(color.Black, 1000)
            timer.after(2000, function () {
                gameState = null
                sprites.destroyAllSpritesOfKind(SpriteKind.UI)
                scene.setBackgroundImage(assets.image`EmptyBg`)
                donkeykong.startGame()
            })
        }
    }
}

function onBButtonPressed() {
    if (!inputEnabled) {
        return
    }
}

function onRightButtonPressed() {
    //console.log("Right button pressed")
    if (!inputEnabled) {
        return
    }

    if (gameState == GameState.MainMenu) {
        music.setVolume(255)
        music.play(menuSwitchGameSfx, music.PlaybackMode.InBackground)
        music.setVolume(128)
        
        gameIconSprites[gameSelected].setImage(gameIconImages[gameSelected][0])
        gameSelected = (gameSelected + 1) % 2
        gameIconSprites[gameSelected].setImage(gameIconImages[gameSelected][1])
        //console.log(dkGameType)
    }
}

function onLeftButtonPressed() {
    //console.log("Left button pressed")
    if (!inputEnabled) {
        return
    }

    if (gameState == GameState.MainMenu) {
        music.setVolume(255)
        music.play(menuSwitchGameSfx, music.PlaybackMode.InBackground)
        music.setVolume(128)
        
        gameIconSprites[gameSelected].setImage(gameIconImages[gameSelected][0])
        gameSelected = (gameSelected + 1) % 2
        gameIconSprites[gameSelected].setImage(gameIconImages[gameSelected][1])
    }
}

function onUpButtonPressed() {
    //console.log("Up button pressed")
    if (!inputEnabled) {
        return
    }

    if (gameState == GameState.MainMenu) {
        return
    }
}

function onDownButtonPressed() {
    //console.log("Down button pressed")
    if (!inputEnabled) {
        return
    }

    if (gameState == GameState.MainMenu) {
        return
    }
}

function returnToMainMenu() {
    // Init
    controller.A.onEvent(ControllerButtonEvent.Pressed, onAButtonPressed)
    controller.B.onEvent(ControllerButtonEvent.Pressed, onBButtonPressed)
    controller.right.onEvent(ControllerButtonEvent.Pressed, onRightButtonPressed)
    controller.left.onEvent(ControllerButtonEvent.Pressed, onLeftButtonPressed)
    controller.up.onEvent(ControllerButtonEvent.Pressed, onUpButtonPressed)
    controller.down.onEvent(ControllerButtonEvent.Pressed, onDownButtonPressed)
    gameState = GameState.MainMenu
    mainMenu()
}


// Init
controller.A.onEvent(ControllerButtonEvent.Pressed, onAButtonPressed)
controller.B.onEvent(ControllerButtonEvent.Pressed, onBButtonPressed)
controller.right.onEvent(ControllerButtonEvent.Pressed, onRightButtonPressed)
controller.left.onEvent(ControllerButtonEvent.Pressed, onLeftButtonPressed)
controller.up.onEvent(ControllerButtonEvent.Pressed, onUpButtonPressed)
controller.down.onEvent(ControllerButtonEvent.Pressed, onDownButtonPressed)

music.stopAllSounds()
gameState = GameState.MainMenu
mainMenuIntro()
mainMenu()

// dkInit()
// dkMainMenu()