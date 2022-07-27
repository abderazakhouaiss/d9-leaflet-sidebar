<?php

namespace Drupal\leaflet_maps\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Returns responses for Leaflet maps routes.
 */
class LeafletMapsController extends ControllerBase {

  /**
   * Builds the response.
   */
  public function build() {
    $data = [
      [
        'coordinates' => [-100, 40],
        'title' => 'Marker 1',
        'desc' => 'Description test description',
        'category' => 'Category 1',
        'id' => 1,
      ],
      [
        'coordinates' => [-105, 45],
        'title' => 'Marker 2',
        'desc' => 'Description test description',
        'category' => 'Category 2',
        'id' => 2,
      ],
      [
        'coordinates' => [-110, 55],
        'title' => 'Marker 3',
        'desc' => 'Description test description',
        'category' => 'Category 3',
        'id' => 3,
      ],
      [
        'coordinates' => [-115, 55],
        'title' => 'Marker 4',
        'desc' => 'Description test description',
        'category' => 'Category 4',
        'id' => 4,
      ],
      [
        'coordinates' => [-110, 45],
        'title' => 'Marker 5',
        'desc' => 'Description test description',
        'category' => 'Category 5',
        'id' => 5,
      ],
      [
        'coordinates' => [-105, 40],
        'title' => 'Marker 6',
        'desc' => 'Description test description',
        'category' => 'Category 6',
        'id' => 6,
      ],
    ];
    $view_c = -107.5;
    $view_l = 56.6;
    $build['content'] = [
      '#theme' => 'leaflet_maps_template',
      '#attached' => [
        'library' => ['leaflet_maps/leaflet_maps'],
        'drupalSettings' => ['data' => $data, 'view_c' => $view_c, 'view_l' => $view_l],
      ]
    ];

    return $build;
  }

}
