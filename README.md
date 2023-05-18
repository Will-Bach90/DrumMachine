# 427Final
## Download Mozzi
* Download and follow directions from their website [here](https://sensorium.github.io/Mozzi/) ([github](https://github.com/sensorium/Mozzi))
* Save .ino and d_kit.h files from above
* Upload sketch to arduino
* At simplest form, audio out goes on pin 9
* * To utilize LEDs, connect to pins 2, 3, 4, 5, 6, 7, 8, 10 with 220ohm resistors
* * To set tempo manually in sketch, set potentiometer to change tempo (and speed of light pattern) via analog pin A0
* To set beat, open serial monitor and send chars according to the following:
* *     |     (X)  (Y)  (Z)  ([)  (\)  (])  (^)  (_)    |  <------> Bass drum
* *     |     (`)  (a)  (b)  (c)  (d)  (e)  (f)  (g)    |  <------> Snare drum  
* *     |     (h)  (i)  (j)  (k)  (l)  (m)  (n)  (o)    |  <------> Closed Hi-Hat
* *     |     (p)  (q)  (r)  (s)  (t)  (u)  (v)  (w)    |  <------> Open Hi-Hat
## Current interface
* Currently set up with webpage ([here](https://will-bach90.github.io/427Final/)) to control ESP32 module via bluetooth (ESP_BLEServer.ino), which then sends commands over serial to arduino uno.
* ![Basic Setup](https://github.com/Will-Bach90/427Final/blob/main/IMG_0269.jpg)
