import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createSerializer } from 'enzyme-to-json';
import 'jest-enzyme';

configure({ adapter: new Adapter() });

expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }));
