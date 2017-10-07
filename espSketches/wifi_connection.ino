#include <Adafruit_NeoPixel.h>
#include <ESP8266WiFi.h>

#define PIN D1
#define LED_AMOUNT 16
Adafruit_NeoPixel strip;

const char* WLAN_SSID = "piWlan";
const char* PASSWORD = "piWlanPass";
const char* IP = "192.168.42.1";
const int PORT = 59003;

//tcp client
WiFiClient client;

void setup() {
  Serial.begin(115200);
  delay(100);

  strip = Adafruit_NeoPixel(LED_AMOUNT, PIN, NEO_GRB + NEO_KHZ800);
  strip.begin();
  
  // We start by connecting to a WiFi network
  Serial.print("Connecting to ");
  Serial.println(WLAN_SSID);

  WiFi.begin(WLAN_SSID, PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());      
  Serial.println("");

  Serial.print("Create TCP connection ");
  while(!client.connect(IP, PORT)) {
    delay(500);
    Serial.print(".");             
  }
  Serial.println("");
  Serial.print("TCP connected to Port ");
  Serial.println(PORT);

  client.print("{'cmd':0,'id':0,'name':'Testboard'}");
}

int value = 0;

void loop() {
  char colorMode = client.read();
  Serial.println(colorMode);
  switch(colorMode){
    case '0': //green
      for(int i=0;i<LED_AMOUNT;i++){
        strip.setPixelColor(i, strip.Color(150,0,0));
      }      
      break;
    case '1': //red
      for(int i=0;i<LED_AMOUNT;i++){
        strip.setPixelColor(i, strip.Color(0,150,0));
      }      
      break;
    case '2': //blue
      for(int i=0;i<LED_AMOUNT;i++){
        strip.setPixelColor(i, strip.Color(0,0,150));
      }      
      break;
  }
  strip.show();
  delay(500);
}

