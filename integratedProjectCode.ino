/*------------------------------------------------ Definitions -------------------------------------------------*/
// Includes
#include <LiquidCrystal_I2C.h>
#include <math.h> // log
#include <avr/interrupt.h>


// Tempo defines
#define TEMPO_HEADER "Tempo: "
#define TEMPO_LENGTH strlen(TEMPO_HEADER)
#define TEMPO_ROW 0
#define TEMPO_PIN A7

// Mode defines
#define MODE_HEADER "Mode:  "
#define MODE_LENGTH strlen(MODE_HEADER)
#define MODE_ROW 1
#define PROGRAM_MODE "Program"
#define PLAY_MODE "Play"

// BPM defines
#define BPM_UNITS " BPM"
#define MAX_BPM 300 //approximately for now
#define MIN_BPM 10

// Button defines
#define BUTTON_DEBOUNCE 150000
#define MIN_VOLTAGE 920

// Switch defines
#define SWITCH_PIN 6



/*--------------------------------------------------- Variables ----------------------------------------------------*/

/*----- general variables -----*/

LiquidCrystal_I2C lcd(0x27, 20, 4); // lcd screen
bool mode;
int tempo;
// set based on initial value of switch, starting switch value should always be program
bool PROGRAM;
bool PLAY;

/*----- interrupt flags -----*/

volatile bool columnButton;
volatile bool rowButton;
volatile bool modeSwitch;


/*----- led variables -----*/

// pins mapped to led lights
int ledPins[4][8] = {{53, 49, 45, 41, 37, 33, 29, 25},
  {51, 47, 43, 39, 35, 31, 27, 23},
  {52, 48, 44, 40, 36, 32, 28, 24},
  {50, 46, 42, 38, 34, 30, 26, 22}
};
// status of each led light, set to false in setup()
bool ledStates[4][8];


/*----- column variables -----*/

// pins mapped to column buttons
int columnPins[8] = {A8, A9, A10, A11, A12, A13, A14, A15};
// time since column was last toggled, used to prevent debounce
unsigned long columnLastToggled[8];


/*----- row variables -----*/

// pins mapped to row buttons
int rowPins[4] = {13, 12, 11, 10};
// pins mapped to row lights
int rowLEDs[4] = {19, 18, 17, 16};
// status of each row led
bool rowStates[4];
// time since row was last toggled, used to prevent debounce
unsigned long rowLastToggled[4];


char characters[4][8] = {{'X', 'Y', 'Z', '[', '\\', ']', '^', '_'},
                       {'`', 'a', 'b', 'c', 'd', 'e', 'f', 'g'},
                       {'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o'},
                       {'p', 'q', 'r', 's', 't', 'u', 'v', 'w'}};



/*---------------------------------------------------- Interrupts ----------------------------------------------------*/

// row button pressed
ISR(PCINT0_vect)
{
  rowButton = true;
}

// mode switch toggled
ISR(PCINT1_vect)
{
  Serial.println("Mode interrupt");
  modeSwitch = true;
}

// column button pressed
ISR(PCINT2_vect)
{
  columnButton = true;
}

/*--------------------------------------------------- Main Program ---------------------------------------------------*/
void setup()
{
  Serial.begin(115200);
  Serial3.begin(115200);
  // tempo and mode based on starting values of potentiometer and switch
  // mode should always default to program so set PROGRAM to initial value of switch and PLAY to opposite
  PROGRAM = digitalRead(SWITCH_PIN);
  PLAY = !PROGRAM;
  mode = PROGRAM;
  tempo = getTempo();

  // Initialize LCD
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, TEMPO_ROW);
  lcd.print(TEMPO_HEADER);
  setLCDTempo();

  lcd.setCursor(0, MODE_ROW);
  lcd.print(MODE_HEADER);
  setLCDMode();

  // initialize LED pins and states
  for (int y = 0; y < 4; y++)
  {
    for (int x = 0; x < 8; x++)
    {
      pinMode(ledPins[y][x], OUTPUT);
      pinMode(ledPins[y][x], LOW);
      ledStates[y][x] = false;
    }
  }

  // initialize column variables
  for (int x = 0; x < 8; x++)
    columnLastToggled[x] = 0;

  // initialize row variables
  for (int y = 0; y < 4; y++)
  {
    rowLastToggled[y] = 0;
    pinMode(rowLEDs[y], OUTPUT);
    pinMode(rowLEDs[y], LOW);
    rowStates[y] = false;
  }

  // enable pin change interrupts for all 3 vectors (buttons, switch, rows)
  PCICR = (1 << PCIE2) | (1 << PCIE1) | (1 << PCIE0);
  // enable 4 pin changes for respective buttons
  PCMSK0 = (1 << PCINT4) | (1 << PCINT5) | (1 << PCINT6) | (1 << PCINT7);
  // enable 1 pin change for corresponding mode switch
  PCMSK1 = (1 << PCINT8);
  // enable all 8 pin changes for column
  PCMSK2 = 0b11111111;

  Serial3.write('1');
}

void loop()
{
  bool currentMode = digitalRead(SWITCH_PIN);
  if (currentMode != mode)
  {
    // reset flag
    modeSwitch = false;
    if (digitalRead(SWITCH_PIN) != mode)
    {
      // toggle pin change interrupts for rows and columns (enabled in program, disabled in play)
      PCICR ^= (1 << PCIE2) | (1 << PCIE0);
      // flip actual stored mode
      mode = !mode;
      // transmit to other board
      Serial3.write('9');
      // update LCD screen
      setLCDMode();
    }
  }
  int currentTempo = getTempo();
  // check if BPM has updated
  if (currentTempo != tempo)
  {
    tempo = currentTempo;
    setLCDTempo();
  }
  if (mode == PROGRAM)
  {
    if (rowButton)
    {
      rowButton = false;
      unsigned long currentTime = micros();
      for (int i = 0; i < 4; i++)
      {
        // if button is pressed and it hasn't been changed within debounce window, update light (curr < lastChanged if micros overflows)
        if (digitalRead(rowPins[i]) && (currentTime > rowLastToggled[i] + BUTTON_DEBOUNCE || currentTime < rowLastToggled[i]))
        {
          rowLastToggled[i] = currentTime;
          digitalWrite(rowLEDs[i], (rowStates[i] = !rowStates[i]));
        }
      }
    }
    if (columnButton)
    {
      columnButton = false;
      unsigned long currentTime = micros();
      for (int i = 0; i < 8; i++)
      {
        // if button is pressed and it hasn't been changed within debounce window, update lights (curr < lastChanged if micros overflows)
        if (analogRead(columnPins[7 - i]) > MIN_VOLTAGE && (currentTime > columnLastToggled[i] + BUTTON_DEBOUNCE || currentTime < columnLastToggled[i]))
        {
          columnLastToggled[i] = currentTime;
          for (int y = 0; y < 4; y++)
          {
            // if row is enabled, toggle led light
            if (rowStates[y])
            {
              digitalWrite(ledPins[y][i], (ledStates[y][i] = !ledStates[y][i]));
              Serial3.write(characters[y][i]);
            }
          }
        }
      }
    }
  }
}




/*---------------------------------------------------- Functions ----------------------------------------------------*/

/*
   Calculates the BPM from the digitized PWM values through tempo's analog pin
   Min BPM: 10
   Max BPM: 300
*/
int getTempo()
{
  int reading = analogRead(TEMPO_PIN);
  // find reading as percentage of 1023, multiply by range of BPM, offset by minimum BPM to find new BPM
  double converted = (((double) reading / 1023.0) * (MAX_BPM - MIN_BPM)) + MIN_BPM;
  // round up or down to closest int value
  return (converted - (int) converted >= 0.5) ? ceil(converted) : floor(converted);
}

/*
   Sets the tempo on LCD screen
*/
void setLCDTempo()
{
  // set initial cursor value to corresponding column index from header, row for tempo
  lcd.setCursor(TEMPO_LENGTH, TEMPO_ROW);

  int bpmSize = log10(tempo) + 1; // use log to find number of digits to write remaining white spaces

  lcd.print(tempo);
  lcd.print(BPM_UNITS);

  // write white spaces to clear remaining characters
  for (int i = TEMPO_LENGTH + bpmSize + strlen(BPM_UNITS); i < 16; i++)
    lcd.print(" ");
}

/*
   Sets the mode on LCD screen
*/
void setLCDMode()
{
  // set initial cursor value to corresponding column index from header, row for mode
  lcd.setCursor(MODE_LENGTH, MODE_ROW);

  // store length of current mode to write remaining white spaces
  int valueLength;

  //checks current mode state
  if (mode == PROGRAM)
  {
    lcd.print(PROGRAM_MODE);
    valueLength = strlen(PROGRAM_MODE);
  }
  else
  {
    lcd.print(PLAY_MODE);
    valueLength = strlen(PLAY_MODE);
  }

  // write white spaces to clear remaining characters
  for (int i = TEMPO_LENGTH + valueLength; i < 16; i++)
    lcd.print(" ");
}
