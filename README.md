![Logo](admin/baresip.png)
# ioBroker.baresip

<!--  
[![NPM version](https://img.shields.io/npm/v/iobroker.baresip.svg)](https://www.npmjs.com/package/iobroker.baresip)
[![Downloads](https://img.shields.io/npm/dm/iobroker.baresip.svg)](https://www.npmjs.com/package/iobroker.baresip)
![Number of Installations](https://iobroker.live/badges/baresip-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/baresip-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.baresip.png?downloads=true)](https://nodei.co/npm/iobroker.baresip/)

**Tests:** ![Test and Release](https://github.com/thomaslusli/ioBroker.baresip/workflows/Test%20and%20Release/badge.svg) 
-->

## baresip adapter for ioBroker

Use of baresip VOIP User-Agent https://github.com/baresip/baresip in iobroker.

## Installation
 - baresip
	+ install baresip
	
	After first start edit some configuration files
	+ .baresip/config
		uncomment "module_app ctrl_tcp.so"
	+ .baresip/accounts
		add sip account

 - Adapter settings:
	+ set port to baresip (default is set in .barsip/config to 4444)
	+ set ip to baresip

## Usage
 Adapter has only interfacing to baresip...

 Example for incoming call:
 - Incoming call
	+ "CALLING_NUMBER" is set to number
		+ "accept"
			+ set "DTMFcode" for sending DTMF
			+ sending by "sendDTMFcode"
		+ "hangup"


## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### 0.0.2

* (thomaslusli) format and test cases

### 0.0.1
* (thomaslusli) initial realeas

## License
MIT License

Copyright (c) 2023 thomaslusli <github@jäger.co.at>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
