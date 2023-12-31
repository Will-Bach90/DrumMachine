# Drum Machine
## Summary
A a drum machine for playing various instruments at certain intervals. Eight columns of buttons are used for controlling the timing of beats, and four rows of buttons are responsible for four instruments. There are two stages: program mode and play mode. During program mode, we set the timing and instruments. During play mode, the drum machine sweeps through at a set tempo using a potentiometer. The LEDs signify whether the beat should play or not during play mode.
![Basic Setup](https://github.com/Will-Bach90/427Final/blob/main/IMG_0281.jpg)
## Parts
* 8Ω 2W GF076 Speaker
* Noyito PAM8406 5W Digital Amplifier Board
* Arduino Uno (Sound Module)
* Arduino Mega (Control Module)
* 36 Various colored LEDs (red, yellow, green, blue)
* 12 Pushbuttons
* 10kΩ Potentiometer
* Various resistors ( 1x270Ω, 13x1kΩ, 32x2.2kΩ, 13x1MΩ) [5% tolerance]
* 0.1 µF capacitor
* JANSANE 16x2 1602 LCD Display Screen
***
## Alternative Setup (Web Application)
Webpage ([here](https://will-bach90.github.io/DrumMachine/)) built with Chrome Web BLE API, used to control ESP32 module via bluetooth (ESP_BLEServer.ino), which then sends commands over serial to arduino uno to set beats and mode.
![Webpage Setup](https://github.com/Will-Bach90/427Final/blob/main/IMG_0269.jpg)
## Parts
* 8Ω 2W GF076 Speaker
* Noyito PAM8406 5W Digital Amplifier Board
* Arduino Uno (Sound Module)
* ESP323D Module (Control Module)
* 8 Various colored LEDs
* 10kΩ Potentiometer
* Resistors ( 8x220Ω, 1x270Ω)
* 0.1 µF capacitor
