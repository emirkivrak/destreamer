import { CLI_ERROR, ERROR_CODE } from './Errors';
import { checkOutDir } from './Utils';
import { logger } from './Logger';
import { templateElements } from './Types';

import fs from 'fs';
import readlineSync from 'readline-sync';
import sanitize from 'sanitize-filename';
import yargs from 'yargs';


export const argv: any = yargs.options({
    username: {
        alias: 'u',
        type: 'string',
        describe: 'Microsoft Stream\'de oturum a\u00E7mak i\u00E7in kullan\u0131lan kullan\u0131c\u0131 ad\u0131 (bunu etkinle\u015Ftirmek e-posta alan\u0131n\u0131 sizin i\u00E7in dolduracakt\u0131r).',
        demandOption: false
    },
    videoUrls: {
        alias: 'i',
        describe: 'Ms teams video, video listesi veya grupları',
        type: 'array',
        demandOption: false
    },
    inputFile: {
        alias: 'f',
        describe: 'indirilerecek URL`leri girdiğiniz input.txt dosyasının yolu, bu dosya hakkında bilgi edinmek için emirkivrak/destreamer veya snobu/destramer readme dosyalarını okuyun.',
        type: 'string',
        demandOption: false
    },
    outputDirectory: {
        alias: 'o',
        describe: 'Videolarınız kaydolacağı dosya dizininin yolu.',
        type: 'string',
        default: 'videos',
        demandOption: false
    },
    outputTemplate: {
        alias: 't',
        describe: 'Başlık için template. Daha fazla bilgi için readme.md okuyunuz.',
        type: 'string',
        default: '{title} - {publishDate} {uniqueId}',
        demandOption: false
    },
    keepLoginCookies: {
        alias: 'k',
        describe: 'Oturum açma sırasında "Beni hatırla" yı kullanabilmeniz için Chromium kimlik sağlayıcı çerezlerini önbelleğe alın.\n' +
                  'Otomatik olarak oturum a\u00E7mak istiyorsan\u0131z, Destreamer\'\u0131 her ba\u015Flatt\u0131\u011F\u0131n\u0131zda kullan\u0131lmal\u0131d\u0131r.\r\n\r\n.',
        type: 'boolean',
        default: false,
        demandOption: false
    },
    noExperiments: {
        alias: 'x',
        describe: 'Videoların ufak fotoğraflarını (thumbnail) konsolda gösterme.',
        type: 'boolean',
        default: false,
        demandOption: false
    },
    simulate: {
        alias: 's',
        describe: 'Video indirme devre dışı bırak, ve videoların metadatalarını konsolda göster.',
        type: 'boolean',
        default: false,
        demandOption: false
    },
    verbose: {
        alias: 'v',
        describe: 'Vidolar hakkında ekstra bilgiyi konsolda göster (gitHub issue açmadan önce lütfen bunu kullanın).',
        type: 'boolean',
        default: false,
        demandOption: false
    },
    closedCaptions: {
        alias: 'cc',
        describe: 'Altyaz\u0131lar\u0131n mevcut olup olmad\u0131\u011F\u0131n\u0131 kontrol edin ve kullan\u0131c\u0131n\u0131n hangisini indirece\u011Fini se\u00E7mesine izin verin (eğer sadece bir tane varsa sormayacak).',
        type: 'boolean',
        default: false,
        demandOption: false
    },
    noCleanup: {
        alias: 'nc',
        describe: 'FFmpeg hatası meydana çıktığında dosyayı silme.',
        type: 'boolean',
        default: false,
        demandOption: false
    },
    vcodec: {
        describe: 'Re-encode video track. Specify FFmpeg codec (e.g. libx265) or set to "none" to disable video.',
        type: 'string',
        default: 'copy',
        demandOption: false
    },
    acodec: {
        describe: 'Re-encode audio track. Specify FFmpeg codec (e.g. libopus) or set to "none" to disable audio.',
        type: 'string',
        default: 'copy',
        demandOption: false
    },
    format: {
        describe: 'output çıkışı (mkv, mp4, mov, anything that FFmpeg supports).',
        type: 'string',
        default: 'mkv',
        demandOption: false
    },
    skip: {
        describe: 'Eğer dosya zaten varsa, atla.',
        type: 'boolean',
        default: false,
        demandOption: false
    }
})
.wrap(120)
.check(() => noArguments())
.check((argv: any) => checkInputConflicts(argv.videoUrls, argv.inputFile))
.check((argv: any) => {
    if (checkOutDir(argv.outputDirectory)) {
        return true;
    }
    else {
        logger.error(CLI_ERROR.INVALID_OUTDIR);

        throw new Error(' ');
    }
})
.check((argv: any) => isOutputTemplateValid(argv))
.argv;


function noArguments(): boolean {
    // if only 2 args no other args (0: node path, 1: js script path)
    if (process.argv.length === 2) {
        logger.error(CLI_ERROR.MISSING_INPUT_ARG, {fatal: true});

        // so that the output stays clear
        throw new Error(' ');
    }

    return true;
}


function checkInputConflicts(videoUrls: Array<string | number> | undefined,
    inputFile: string | undefined): boolean {
    // check if both inputs are declared
    if ((videoUrls !== undefined) && (inputFile !== undefined)) {
        logger.error(CLI_ERROR.INPUT_ARG_CONFLICT);

        throw new Error(' ');
    }
    // check if no input is declared or if they are declared but empty
    else if (!(videoUrls || inputFile) || (videoUrls?.length === 0) || (inputFile?.length === 0)) {
        logger.error(CLI_ERROR.MISSING_INPUT_ARG);

        throw new Error(' ');
    }
    else if (inputFile) {
        // check if inputFile doesn't end in '.txt'
        if (inputFile.substring(inputFile.length - 4) !== '.txt') {
            logger.error(CLI_ERROR.INPUTFILE_WRONG_EXTENSION);

            throw new Error(' ');
        }
        // check if the inputFile exists
        else if (!fs.existsSync(inputFile)) {
            logger.error(CLI_ERROR.INPUTFILE_NOT_FOUND);

            throw new Error(' ');
        }
    }

    return true;
}


function isOutputTemplateValid(argv: any): boolean {
    let finalTemplate: string = argv.outputTemplate;
    const elementRegEx = RegExp(/{(.*?)}/g);
    let match = elementRegEx.exec(finalTemplate);

    // if no template elements this fails
    if (match) {
        // keep iterating untill we find no more elements
        while (match) {
            if (!templateElements.includes(match[1])) {
                logger.error(
                    `'${match[0]}' is not available as a template element \n` +
                    `Available templates elements: '${templateElements.join("', '")}' \n`,
                    { fatal: true }
                );

                process.exit(1);
            }
            match = elementRegEx.exec(finalTemplate);
        }
    }
    // bad template from user, switching to default
    else {
        logger.warn('Empty output template provided, using default one \n');
        finalTemplate = '{title} - {publishDate} {uniqueId}';
    }

    argv.outputTemplate = sanitize(finalTemplate.trim());

    return true;
}


export function promptUser(choices: Array<string>): number {
    let index: number = readlineSync.keyInSelect(choices, 'Which resolution/format do you prefer?');

    if (index === -1) {
        process.exit(ERROR_CODE.CANCELLED_USER_INPUT);
    }

    return index;
}
