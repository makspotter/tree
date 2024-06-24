import * as uuid from 'uuid';

export const TREE_DATA = [
  {
    id: uuid.v4(),
    label: 'root',
    icon: 'folder',
    children: [
      {
        id: uuid.v4(),
        label: 'folder-0',
        icon: 'folder',
        children: [
          {
            id: uuid.v4(),
            label: 'file-0-0',
            icon: 'panorama',
          },
          {
            id: uuid.v4(),
            label: 'folder-0-1',
            icon: 'folder',
            children: [
              {
                id: uuid.v4(),
                label: 'file-0-1-0',
                icon: 'panorama',
              },
              {
                id: uuid.v4(),
                label: 'file-0-1-1',
                icon: 'panorama',
              },
            ],
          },
        ],
      },
      {
        id: uuid.v4(),
        label: 'file-1',
        icon: 'panorama',
      },
    ],
  },
];
