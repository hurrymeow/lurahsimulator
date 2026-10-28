// Inem, the assistant. A 44x60 portrait in the map's pixel rules (ART.md): coloured 1px outlines, two-tone
// cel shading lit from the top left, INK only for eyes and small dark features. Stored as palette rows so it is
// drawn in code like every other sprite. '.' is transparent.

const PAL: Record<string, string> = {
  'A': '#df4a2c',
  'B': '#a8321f',
  'C': '#7c5b40',
  'D': '#5a422e',
  'E': '#6d635a',
  'F': '#e2a675',
  'G': '#a37854',
  'H': '#bdb4a3',
  'I': '#4e4741',
  'J': '#664b35',
  'K': '#493626',
  'L': '#2b2724',
  'M': '#8c6749',
  'N': '#c28f65',
  'O': '#531824',
  'P': '#972b41',
  'Q': '#742132',
  'R': '#d23c5a',
  'S': '#5e1b28',
  'T': '#44131d',
  'a': '#130c08',
  'b': '#0a0604',
  'c': '#2a1a11',
  'd': '#20130d',
  'e': '#170e09',
  'f': '#462a1c',
  'g': '#7a4a30',
  'h': '#20140d',
  'i': '#1b100b',
  'j': '#3b2418',
  'k': '#673746',
  'l': '#e57a9c',
  'm': '#26170f',
  'n': '#f6ecd4',
  'o': '#a55870',
  'p': '#88694d',
  'q': '#f4b935',
  'r': '#f8be8c',
  's': '#eab384',
  't': '#110a07',
  'u': '#816249',
  'v': '#5c4734',
  'w': '#a8815f',
  'x': '#2a1810',
  'y': '#f07f86',
  'z': '#bb8f6a',
};

const ROWS = [
  '............................................',
  '...................aaaaaaa..................',
  '................aabcccccccbad...............',
  '..............aacceeeeeeeeecfdd.............',
  '.............acceefffffffffeeffd............',
  '............aceeffgggffffffffehfi...........',
  '...........aceffggffjjjjjjjjjffhji..........',
  '..........bcefffffjjjjjjjjjjjjjfhja.........',
  '.........keeffffjjjjjjjjjjjjjjjjchca........',
  '........klllmffjjjjcjjjjjjjjjjjjcceca.......',
  '.......klllllmjjjjjcccccjjjjjjjjccmcca......',
  '......kllnlllohjjjcccpcccjjjjjjjccmcca......',
  '......klllqllomjjjcccpppppcjjjjjccmcca......',
  '......kllllloomfjcccprrsrrpcjjjjccmccca.....',
  '......tmllloomffjcccprrssssuvjjjccmccca.....',
  '......dfeooomcffcjjprrssssjjwvjjccmccca.....',
  '......dfceemfcccjccjrrsssjssjvfjccmccca.....',
  '......dfcceffccpxcprrssssssswvffcceccca.....',
  '......dfcceffccxpxxrrssssssswvffcceccca.....',
  '......dfccefcccpxnxxssssssxxsxffcceccca.....',
  '.......dfcefgccpxxxxsssssxssxvffccecca......',
  '.......dfjefgcprrxxsssssssssswvcccmcca......',
  '.......dffhfccprrsssssssssssswvcccmcca......',
  '.......dffjeccpyyssssszssssyywvccmffca......',
  '......dfffjjecprssssssssssssswvcmfffcca.....',
  '......dfffjjjqrrsssszssszsxswwwmfffjjca.....',
  '.....dfffjjjqhrrssssAAAAAsswwwwmffjjjcca....',
  '.....dffgjjjqjqrsssssBBBsswwwwmffjjjjcca....',
  '....dfffgjjjjqjhssssssssswwwwmfffjjjjccca...',
  '....dfffjgjjjjjjewssssswwwwwmfffjjjjjccca...',
  '....dffjjjjjjjjjcewwwwwwwwweemfjjjjjcccca...',
  '....dffjjjjjjjcccceCwwwwwDeeEEhjjjjjcccca...',
  '....dffjjjjccccccceFCCCCDGeHHEEhjjjccccca...',
  '.....dfjjcccccccceeFFFFFFDEHEEEIhjjcccca....',
  '.....acjcccccceeeFFFFFFFFCEEEEIImjccccca....',
  '......accccceeFFFFFFFFFFFFDEEIIemccccca.....',
  '......acceceFFFFFFFFFFFFFFGDEICFFecccca.....',
  '.......beGeFFFFFFFqFFFFFqFGDqqCFFGecca......',
  '........JGFFFFFFFFFqqFqqFFGDEICFGGGeKK......',
  '.......JFFFFFFFFFFFFFqFFFFGDILCGGGGFGGK.....',
  '.......JFFFGFFFFFFFFFFMFFGGDLFFGGGCFGGK.....',
  '......JFFFGGGGGFFFFFFNMNFGGGFFFFGOPCGGK.....',
  '......JFFFGQQQGGGGGGGGMGGGGFFFFFGOPCGGK.....',
  '......JFFFGQRnQQQGGGGGGGGGGFFFFGGOPCGGK.....',
  '.....JFFFGGQRRRRRqQQQQQQnQQQFFGGFOPCFGK.....',
  '.....JFFFGQRRRRRRRRRRRRRRRRRQGGFFGOCFGK.....',
  '....JFFFGGKRRRRRRRRRRqRRRRRqROOFFFCFFGGK....',
  '....JFFFGKSRRRRnRRRRRRRRRRRRRPPOFFFFFGGK....',
  '.....JFFFJ.SRRRRRRRRRRRRRRRRPPPPOFFFFGGK....',
  '....JFFFFFJJSRRRRRRnRRRRRRRPPPPPTFFFGGGK....',
  '.....JFFFFFFJQRRRRRRRRRRRqRPPPPPTKGFFGGK....',
  '......KGFFFFFFQRRRRRRRRRRRRRPPPT..KGGFGK....',
  '.......KJFFFFFGQRqRRRRRRRRRRPPT...KGGGGK....',
  '.........JFFFFGQRRRRRRRRRRRRRPT...KGKKK.....',
  '.........JFFFGGQRRRRRRRRRRRRRRPT...K........',
  '..........KGGGQRRRRRqRRRRRRRRRPT............',
  '...........KTQnRRRRRRRRRRRRRRRRPT...........',
  '...........TPPPPPPPPPPPPPPPPPPPPPT..........',
  '...........TPPPPPPPPPPPPPPPPPPPPPT..........',
  '..........TPPPPPPPPPPPPPPPPPPPPPPPT.........',
];

export const INEM_W = 44;
export const INEM_H = 60;

let cached: string | null = null;

/** Inem's portrait as a PNG data URL, drawn once at 1 art pixel per pixel. Scale it with CSS (image-rendering: pixelated). */
export function inemURL(): string {
  if (cached) return cached;
  const c = document.createElement('canvas');
  c.width = INEM_W;
  c.height = INEM_H;
  const ctx = c.getContext('2d')!;
  ROWS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const k = row[x];
      if (k === '.') continue;
      ctx.fillStyle = PAL[k];
      ctx.fillRect(x, y, 1, 1);
    }
  });
  cached = c.toDataURL();
  return cached;
}
