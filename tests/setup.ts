import { setRoadRule } from '../src/sim/access';
import { setLang } from '../src/i18n';

// Sim tests assert on English messages. The app default is Indonesian, so they switch to English here.
setLang('en');

// Most sim tests place buildings anywhere. tests/access.test.ts turns the road rule back on.
setRoadRule(false);
