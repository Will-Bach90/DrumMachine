# 427Final
## Download Mozzi
* Download and follow directions from their website [here](https://sensorium.github.io/Mozzi/) ([github](https://github.com/sensorium/Mozzi))
* Save .ino and d_kit.h files from above
* Upload sketch to arduino
* At simplest form, audio out goes on pin 9
* * To utilize LEDs, connect to pins 2, 3, 4, 5, 6, 7, 8, 10 with 220ohm resistors
* * Set tempo manually in sketch, could use potentiometer to change tempo via analog pin
* To set beat, open serial monitor and send chars according to the following:
* *     |     (X)  (Y)  (Z)  ([)  (\)  (])  (^)  (_)    |  <------> Bass drum
* *     |     (`)  (a)  (b)  (c)  (d)  (e)  (f)  (g)    |  <------> Snare drum  
* *     |     (h)  (i)  (j)  (k)  (l)  (m)  (n)  (o)    |  <------> Closed Hi-Hat
* *     |     (p)  (q)  (r)  (s)  (t)  (u)  (v)  (w)    |  <------> Open Hi-Hat
## Next
* Integrating web interface to set pattern and communicate with uno over serial via bluetooth module (ESP32)
* ...
