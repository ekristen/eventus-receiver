# Eventus Receiver

WIP. WIP. WIP. Everything subject to change.

This is the first in a line of repos that is making up a project I am calling Eventus for the time being. It is a events collection tool, when dealing with distributed systems, and multiple cloud sources, sometimes its nice to have a agnostic tool that can receive events from multiple sources that you can do something with. 

The Eventus Receiver is a very simple API that is designed to receive events from a few different tools like Splunk, GitHub, AWS and itself. For Github, AWS and itself, it does signature verification so you know the message is real and valid. For other tools, I'm working a few different ideas like IP restrictions, essentially you want Eventus to be accessible, but you don't want just anyone sending events.




