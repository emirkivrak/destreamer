![destreamer](assets/logo.png)

# Mikrosoft Stream videolarını offline izlemek için bilgisayarınıza kaydeder.

### v2 Release, codename _Hammer of Dawn<sup>TM</sup>_

[Orjinal Repo](https://github.com/snobu/destreamer) olup tarafımca <b>sadece</b> çevirilmiş ve buildi alınmıştır.

## Feragatname

Umarız ki, Microsoft Stream için son kullanıcı sözleşmesini bozmaz. HLS akışını sanki bir web tarayıcısıymış gibi diske kaydetmekte, ve akışın uçnoktalarını kötüye kullanmamaktayız. Ancak, Microsoft veya Office 365 yöneticileriniz sizinle küçük beyaz bir odada sohbet etmek isterse hiç bir sorumluluk kabul etmiyorum :)

## Direk kullanım 

Direk kullanmak için (built packages) içinden işletim sisteminize göre olan ZİP dosyasınını indirin ve çalıştırın. 

Nasıl kullanacağınız kısmında alt kısımda bulunan örnek kullanımlar kısmını inceleyin.


<hr>



## Ön Gereksinimler

- [**Node.js**][node]: 8.0 ve üstü bir Nodejs'e sahip olmanız gerekmekte, tavsiye edilen versiyon 10+ dır.

- **npm**: npm genelde NodeJS indirilip kurulduktan sonra yanında kurulur, terminale `npm` yazarak varlığını kontrol edebilirsiniz.
- [**ffmpeg**][ffmpeg]: 2019 ve üstü çıkışlı ffmpeg `$PATH` sisteminizde ortam değişkenlerinde tanımlı veya projenin ana dizininde bulunmalıdır.

ffmpeg [windows için kurulum](https://www.wikihow.com/Install-FFmpeg-on-Windows) tıklayarak kurabilirsiniz.

- [**git**][git]: NPM paketlerinden bazıları git gerekitirmekte.

Destreamer Linux,Windows ve MacOS üzerinde test edilmiş ve çalışmaktadır.



## Kendi tarayıcım ile kullanabilir miyim

<b> isteğe bağlı, bu kısmı atlayabilirsiniz destramer default olarak [chromium](https://www.chromium.org/Home) kuracak ve bu tarayıcı üzerinden MS Streame giriş yapıp indirme işlemi başlatabilir </b>

Evet kulanabilirsiniz, Eğer tarayıcınız bir takım kimlik doğrulamak eklentileri kullanıyor ise bu doğru olur, bunu yapmak için `src/destreamer.ts` dosyası içinde aşşağıdaki kod parçacığına konumlanın

```typescript
const browser: puppeteer.Browser = await puppeteer.launch({
        executablePath: getPuppeteerChromiumPath(),
        headless: false,
        userDataDir: (argv.keepLoginCookies) ? chromeCacheFolder : undefined,
        args: [
            '--disable-dev-shm-usage',
            '--fast-start',
            '--no-sandbox'
        ]
    });
```

`executablePath` kısmına kendi tarayıcınızın yolunu aşşağıdaki biçimde ekleyin
```typescript
        executablePath: 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
```

Dosya yolu linux ve macOS'da daha farklı gözükecektir.

Her yaptığınız konfigrasyon için (`npm run build`) ile tekrardan build almanız gerektiğini unutmayın.

## Nasıl build alınır

destrameri build etmek için üste belirtilen öngereksinimleri kurduktan sonra aşşağıdaki işlemleri izleyin.


```sh
$ git clone https://github.com/snobu/destreamer
veya 
git clone https://github.com/emirkivrak/destreamer (türkçe)


$ cd destreamer
$ npm install
$ npm run build
```

## Kullanım

destreamer ile yapabilecekleriniz yazmaktadır, bu standart çıktı sizde türkçe gözükecek.
```
$ ./destreamer.sh

Options:
  --help                  Show help                                                                            [boolean]
  --version               Show version number                                                                  [boolean]
  --username, -u          The username used to log into Microsoft Stream (enabling this will fill in the email field for
                          you).                                                                                 [string]
  --videoUrls, -i         List of urls to videos or Microsoft Stream groups.                                     [array]
  --inputFile, -f         Path to text file containing URLs and optionally outDirs. See the README for more on outDirs.
                                                                                                                [string]
  --outputDirectory, -o   The directory where destreamer will save your downloads.          [string] [default: "videos"]
  --outputTemplate, -t    The template for the title. See the README for more info.
                                                                [string] [default: "{title} - {publishDate} {uniqueId}"]
  --keepLoginCookies, -k  Let Chromium cache identity provider cookies so you can use "Remember me" during login.
                          Must be used every subsequent time you launch Destreamer if you want to log in automatically.
                                                                                              [boolean] [default: false]
  --noExperiments, -x     Do not attempt to render video thumbnails in the console.           [boolean] [default: false]
  --simulate, -s          Disable video download and print metadata information to the console.
                                                                                              [boolean] [default: false]
  --verbose, -v           Print additional information to the console (use this before opening an issue on GitHub).
                                                                                              [boolean] [default: false]
  --closedCaptions, --cc  Check if closed captions are available and let the user choose which one to download (will not
                          ask if only one available).                                         [boolean] [default: false]
  --noCleanup, --nc       Do not delete the downloaded video file when an FFmpeg error occurs.[boolean] [default: false]
  --vcodec                Re-encode video track. Specify FFmpeg codec (e.g. libx265) or set to "none" to disable video.
                                                                                              [string] [default: "copy"]
  --acodec                Re-encode audio track. Specify FFmpeg codec (e.g. libopus) or set to "none" to disable audio.
                                                                                              [string] [default: "copy"]
  --format                Output container format (mkv, mp4, mov, anything that FFmpeg supports).
                                                                                               [string] [default: "mkv"]
  --skip                  Skip download if file already exists.                               [boolean] [default: false]
```

- both --videoUrls and --inputFile also accept Microsoft Teams Groups url so if your Organization placed the videos you are interested in a group you can copy the link and Destreamer will download all the videos it can inside it! A group url looks like this https://web.microsoftstream.com/group/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

- Passing `--username` is optional. It's there to make logging in faster (the username field will be populated automatically on the login form).

- `-o` parametresi ile tam dizin yolu vererek dosyanın nereye indirileceğini söyleyebilirsiniz `/mnt/videos`.

- default olarak çıkış formatı `mkv` dir bunu `--format mp4` şeklinde değiştirebilirsiniz.

## Örnek kullanımlar

örnekler linux üzerinde yapıldı, işletim sisteminize göre powershell/terminal/cmd kullanabilirsiniz

Bir video indir
```sh
$ ./destreamer.sh -i "https://web.microsoftstream.com/video/VIDEO-1"
```

Download a video and re-encode with HEVC (libx265) -
```sh
$ ./destreamer.sh -i "https://web.microsoftstream.com/video/VIDEO-1" --vcodec libx265
```

Username girişi ile msteamse bağlanma süreni kısalt -
```sh
$ ./destreamer.sh -u user@example.com -i "https://web.microsoftstream.com/video/VIDEO-1"
```

Download a video to a custom path -
```sh
$ ./destreamer.sh -i "https://web.microsoftstream.com/video/VIDEO-1" -o /Users/hacker/Downloads
```

Download two or more videos -
```sh
$ ./destreamer.sh -i "https://web.microsoftstream.com/video/VIDEO-1" \
                     "https://web.microsoftstream.com/video/VIDEO-2"
```

Download many videos but read URLs from a file -
```sh
$ ./destreamer.sh -f list.txt
```
### Input file
You can create a `.txt` file containing your video URLs, one video per line. The text file can have any name, followed by the `.txt` extension.
Additionally you can have destreamer download each video in the input list to a separate directory.
These optional lines must start with white space(s).

Usage -
```
https://web.microsoftstream.com/video/xxxxxxxx-aaaa-xxxx-xxxx-xxxxxxxxxxxx
 -dir=videos/lessons/week1
https://web.microsoftstream.com/video/xxxxxxxx-aaaa-xxxx-xxxx-xxxxxxxxxxxx
        -dir=videos/lessons/week2"
```

### Title template
The `-t` option allows users to input a template string for the output file names.

You can use one or more of the following magic sequence which will get substituted at runtime. The magic sequence must be surrounded by curly brackets like this: `{title} {publishDate}`

- `title`: Video title
- `duration`: Video duration in HH:MM:SS format
- `publishDate`: The date when the video was published in YYYY-MM-DD format
- `publishTime`: The time the video was published in HH:MM:SS format
- `author`: Name of video publisher
- `authorEmail`: E-mail of video publisher
- `uniqueId`: An _unique-enough_ ID generated from the video metadata

Example -
```
Input:
    -t '{title} - {duration} - {publishDate} - {publishTime} - {author} - {authorEmail} - {uniqueId}'

Expected filename:
    This is an example - 0:16:18 - 2020-07-30 - 10:30:13 - lukaarma - example@domain.org - #3c6ca929.mkv
```

## Expected output

Windows Terminal -

![screenshot](assets/screenshot-win.png)

iTerm2 on a Mac -

![screenshot](assets/screenshot-mac.png)

By default, downloads are saved under project root `Destreamer/videos/` ( Not the system media Videos folder ), unless specified by `-o` (output directory).


## Limits and limitations

İşletim sistemninize göre doğru scripti ve kaçış karakterini kullandığınıza emin olun (`.sh`, `.ps1` or `.cmd`) 
PowerShell backtick [ **`** ] ve cmd.exe caret kullanmakta[ **^** ].

Note that destreamer won't run in an elevated (Administrator/root) shell. Running inside **Cygwin/MinGW/MSYS** may also fail, please use **cmd.exe** or **PowerShell** if you're on Windows.

**WSL** (Windows Subsystem for Linux) is not supported as it can't easily pop up a browser window. It *may* work by installing an X Window server (like [Xming][xming]) and exporting the default display to it (`export DISPLAY=:0`) before running destreamer. See [this issue for more on WSL v1 and v2][wsl].

## Contributing

Contributions are welcome. Open an issue first before sending in a pull request. All pull requests require at least one code review before they are merged to master.


## Found a bug?

Please open an [issue](https://github.com/snobu/destreamer/issues) and we'll look into it.


[ffmpeg]: https://www.ffmpeg.org/download.html
[xming]: https://sourceforge.net/projects/xming/
[node]: https://nodejs.org/en/download/
[git]: https://git-scm.com/downloads
[wsl]: https://github.com/snobu/destreamer/issues/90#issuecomment-619377950
[polimi]: https://www.polimi.it
[unipi]: https://www.unipi.it/
[unical]: https://www.unical.it/portale/
[unipr]: https://www.unipr.it/
