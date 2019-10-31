# potato-remote-devtools :christmas_tree:

You can debug a page somewhere other than Chrome on desktop (a mobile browser, an embedded webview, Safari, etc).

## Usage

### 1. Local use :gift:

~~~
npm install
npm run dev
~~~

Then will open a electron application that waiting for connection.

### 2. Global use :jack_o_lantern:

Run follow cmd in current directory.

~~~
npm link
~~~

that will generate a global cmd `potato-devtools`, Run:

~~~bash
$: potato-devtools
~~~

to launch the application.

### 3. Add Fuse :santa:

add:

```html
<script src="http://localhost:8098"></script>
```

or(debug remotely, **your devices must running at a inter network both**)

```html
<script src="http://<your-local-ip>:8098"></script>
```

## Others

1. You can run `PORT=xxx npm run dev` or `PORT=xxx potato-devtools` to change monitor port.

2. you can use [ngrok](https://ngrok.com/) proxy to access and debug your app in the external network.