import { OpaqueToken } from '@angular/core';

export let APP_CONFIG = new OpaqueToken('app.config');

export const INSPIRE_EDITOR_CONFIG: AppConfig = {
  schemaOptions: {
    "abstracts.items.properties.value": {
      "x_editor_priority": 1
    },
    "accelerator_experiments.items.properties.curated_relation": {
      "x_editor_hidden": true
    },
    "accelerator_experiments.items.properties.record": {
      "x_editor_hidden": true
    },
    "arxiv_eprints.items.properties.value": {
      "x_editor_priority": 1
    },
    "authors.items.properties.affiliations.items.properties.curated_relation": {
      "x_editor_hidden": true
    },
    "authors.items.properties.affiliations.items.properties.record": {
      "x_editor_hidden": true
    },
    "authors.items.properties.affiliations.items.properties.value": {
      "x_editor_priority": 1
    },
    "authors.items.properties.full_name": {
      "x_editor_priority": 1
    },
    "authors.items.properties.affiliations": {
      "x_editor_priority": 2
    },
    "authors.items.properties.curated_relation": {
      "x_editor_hidden": true
    },
    "authors.items.properties.uuid": {
      "x_editor_hidden": true
    },
    "authors.items.properties.record": {
      "x_editor_hidden": true
    },
    "collaboration.items.properties.record": {
      "x_editor_hidden": true
    },
    "collaboration.items.properties.value": {
      "x_editor_priority": 1
    },
    "dois.items.properties.value": {
      "x_editor_priority": 1
    },
    "external_system_numbers.items.properties.value": {
      "x_editor_priority": 1
    },
    "hidden_notes.items.properties.value": {
		  "x_editor_priority": 1
    },
    "isbns.items.properties.value": {
		  "x_editor_priority": 1
    },
    "keywords.items.properties.keyword": {
		  "x_editor_priority": 1
    },
    "persistent_identifiers.items.properties.value": {
		  "x_editor_priority": 1
    },
    "public_notes.items.properties.value": {
	  	"x_editor_priority": 1
    },
    "publication_info.items.properties.conference_record": {
      "x_editor_hidden": true
    },
    "publication_info.items.properties.curated_relation": {
      "x_editor_hidden": true
    },
    "publication_info.items.properties.parent_record": {
      "x_editor_hidden": true
    },
    "publication_info.items.properties.journal_record": {
      "x_editor_hidden": true
    },
    "publication_info.items.properties.journal_title": {
      "x_editor_priority": 1
    },
    "publication_info.items.properties.journal_volume": {
      "x_editor_priority": 2
    },
    "publication_info.items.properties.page_start": {
      "x_editor_priority": 3
    },
    "publication_info.items.properties.page_end": {
      "x_editor_priority": 4
    },
    "publication_info.items.properties.year": {
      "x_editor_priority": 5
    },
    "references.items.properties.record": {
      "x_editor_hidden": true
    },
    "report_numbers.items.properties.value": {
      "x_editor_priority": 1
    },
    "self": {
      "x_editor_hidden": true
    },
    "titles.items.properties.title": {
      "x_editor_priority": 1
    },
    "urls.items.properties.value": {
      "x_editor_priority": 1
    }
}
};