# 427Final
## Summary
Our project is a drum machine for playing various instruments at certain intervals. Eight columns of buttons are used for controlling the timing of beats, and four rows of buttons are responsible for four instruments. There are two stages: program mode and play mode. During program mode, we set the timing and instruments. During play mode, the drum machine sweeps through at a set tempo using a potentiometer. The LEDs signify whether the beat should play or not during play mode.
* ![Basic Setup](https://github.com/Will-Bach90/427Final/blob/main/IMG_0821.jpg)
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
## Alternative Setup (Web Application)
Webpage ([here](https://will-bach90.github.io/427Final/)) used to control ESP32 module via bluetooth (ESP_BLEServer.ino), which then sends commands over serial to arduino uno to set beats and mode.
