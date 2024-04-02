import { List, Map } from 'immutable';

export default Map({
  title: Map({ title: 'Introduction to Quantum Mechanics' }),
  id: 1,
  abstract: Map({
    value:
      ' But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure? On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee',
  }),
  keywords: ['quantum', 'mechanics', 'physics'],
  authors: List([
    Map({ name: 'John Smith', affiliation: 'University X' }),
    Map({ name: 'Emily Johnson', affiliation: 'University Y' }),
    Map({ name: 'Robert Brown', affiliation: 'University Z' }),
    Map({ name: 'Sarah White', affiliation: 'University W' }),
  ]),
  date: '2024-04-02',
  publisher: 'Science Publishers Inc.',
  dois: List([Map({ value: '10.1234/5678' }), Map({ value: '10.8765/4321' })]),
  publicationInfo: List([
    Map({
      journal_title: 'Science Publishers Inc.',
      volume: '12',
      journal_issue: '4',
      page_start: '123',
      page_end: '456',
    }),
  ]),
  status: 'completed',
  error: `Traceback (most recent call last):
    File "/usr/lib/python2.7/site-packages/workflow/engine.py", line 529, in _process
      self.run_callbacks(callbacks, objects, obj)
    File "/usr/lib/python2.7/site-packages/workflow/engine.py", line 465, in run_callbacks
      indent + 1)
    File "/usr/lib/python2.7/site-packages/workflow/engine.py", line 465, in run_callbacks
      indent + 1)
    File "/usr/lib/python2.7/site-packages/workflow/engine.py", line 481, in run_callbacks
      self.execute_callback(callback_func, obj)
    File "/usr/lib/python2.7/site-packages/workflow/engine.py", line 564, in execute_callback
      callback(obj, self)
    File "/code/inspirehep/modules/workflows/utils/__init__.py", line 155, in _decorator
      res = func(*args, **kwargs)
    File "/code/inspirehep/modules/workflows/tasks/arxiv.py", line 130, in arxiv_package_download
      url=current_app.config['ARXIV_TARBALL_URL'].format(arxiv_id=arxiv_id),
    File "/usr/lib/python2.7/site-packages/backoff/_sync.py", line 94, in retry
      ret = target(*args, **kwargs)
    File "/code/inspirehep/modules/workflows/utils/__init__.py", line 344, in download_file_to_workflow
      workflow.files[name] = req.raw
    File "/usr/lib/python2.7/site-packages/invenio_records_files/api.py", line 101, in wrapper
      return method(self, *args, **kwargs)
    File "/usr/lib/python2.7/site-packages/invenio_records_files/api.py", line 170, in __setitem__
      bucket=self.bucket, key=key, stream=stream
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/models.py", line 1169, in create
      obj.set_contents(stream, **kwargs)
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/models.py", line 145, in inner
      return f(self, *args, **kwargs)
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/models.py", line 131, in inner
      res = f(self, *args, **kwargs)
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/models.py", line 1010, in set_contents
      default_storage_class=self.bucket.default_storage_class,
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/models.py", line 145, in inner
      return f(self, *args, **kwargs)
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/models.py", line 830, in set_contents
      size_limit=size_limit, progress_callback=progress_callback))
    File "/usr/lib/python2.7/site-packages/invenio_xrootd/storage.py", line 111, in inner
      res = f(self, *args, **kwargs)
    File "/usr/lib/python2.7/site-packages/invenio_xrootd/storage.py", line 175, in save
      return super(EOSFileStorage, self).save(*args, **kwargs)
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/storage/pyfs.py", line 99, in save
      fp = self.open(mode='wb')
    File "/usr/lib/python2.7/site-packages/invenio_files_rest/storage/pyfs.py", line 58, in open
      return fs.open(path, mode=mode)
    File "/usr/lib/python2.7/site-packages/xrootdpyfs/fs.py", line 197, in open
      **kwargs
    File "/usr/lib/python2.7/site-packages/xrootdpyfs/xrdfile.py", line 126, in __init__
      "instantiating file ({0})".format(path))
    File "/usr/lib/python2.7/site-packages/xrootdpyfs/xrdfile.py", line 140, in _raise_status
      raise IOError(errstr)
  IOError: XRootD error instantiating file (root://eospublic.cern.ch//eos/workspace/i/inspireqa/app/var/data/workflows/files/22/ac/73d1-b19d-4dcc-afa2-0edf97530a69/data?eos.bookingsize=104857600) file: [ERROR] Server responded with an error: [3021] Unable to get quota space - quota not defined or exhausted /eos/workspace/i/inspireqa/app/var/data/workflows/files/22/ac/73d1-b19d-4dcc-afa2-0edf97530a69/data; Disk quota exceeded
`,
});
