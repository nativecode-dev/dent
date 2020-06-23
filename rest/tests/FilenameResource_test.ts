import { assertEquals } from '../test_deps.ts'

import { FilenameResource } from './FilenameResource.ts'

Deno.test('should get filename', async () => {
  const expected = {
    title: 'Inheritance',
    year: 2020,
    other: ['Proper', 'Rip'],
    proper_count: 1,
    screen_size: '1080p',
    source: 'Web',
    video_codec: 'H.264',
    release_group: 'RARBG',
    container: 'mp4',
    mimetype: 'video/mp4',
    type: 'movie',
  }

  const resource = new FilenameResource({ connection: { endpoint: { host: 'guessit.nativecode.com', protocol: 'http' } } })
  const response = await resource.filename('Inheritance.2020.PROPER.1080p.WEBRip.x264-RARBG.mp4')
  assertEquals(response, expected)
})
