_icfp-contest-2020_
===================

This project is based on starter kit for Haskell.

Then, we've added REPL implementation in JS. Use it by opening the [HTML file](repl/index.html) in your browser. Run tests with `node repl/repl.js`.

Then, we've changed the server implementation to Python. Install deps with:

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Run tests with `python -m pytest .'`

Using modulator/demodulator via Python REPL:

```
python # make sure you've activated the venv with "source venv/bin/activate"
>>> import app.main
>>> app.main.make_request_body([0])
'1101000'
>>> app.main.parse_response_body('1101000')
[0]
```

Sending request to Alien Proxy API:

```
>>> import app.main
>>> app.main.send_val([0], 'https://icfpc2020-api.testkontur.ru', '<PUT API KEY HERE>')
[1, 28985]
```

Signing off,

Church of the Least Fixed Point.

- [Miëtek Bak](http://github.com/mietek)
- [Jan Dudek](http://github.com/jdudek)
- [Arek Flinik](http://github.com/aflinik)
- [Alexander Juda](http://github.com/alexjuda)

---

Previously:

- http://github.com/mietek/icfp-contest-2017
- http://github.com/mietek/icfp-contest-2015
- http://github.com/mietek/icfp-contest-2014
- http://github.com/mietek/icfp-contest-2013
- http://github.com/mietek/icfp-contest-2012
- http://github.com/mietek/icfp-contest-2011
- http://github.com/mietek/icfp-contest-2010
- http://github.com/mietek/icfp-contest-2009
- http://github.com/mietek/icfp-contest-2008
- 2007
- 2006
