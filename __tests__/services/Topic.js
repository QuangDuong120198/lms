import { createTopic, searchTopic } from '../../server/services/elassandra/Topic';
import { randomName } from '../helpers/random';
import { closeConnection } from '../helpers/close';

describe('Topic Services', () => {
  it('createTopic', async () => {
    const name = randomName();
    const res = await createTopic(name);
    expect(res.wasApplied()).toBeTruthy();
  });

  it('searchTopic', async () => {
    const keyword = randomName();
    const res = await searchTopic(keyword, 1);
    expect(res.body.hits).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        hits: expect.any(Array)
      })
    );
  });
});

afterAll(closeConnection);
