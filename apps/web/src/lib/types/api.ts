export interface DataForSeoTaskResponse {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: Array<{
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    cost: number;
    result_count: number;
    path: string[];
    data: {
      api: string;
      function: string;
      se: string;
      location_name: string;
      keyword: string;
      language_code: string;
      depth: number;
    };
    result: Array<{
      keyword: string;
      type: string;
      se_domain: string;
      location_code: number;
      language_code: string;
      check_url: string;
      datetime: string;
      spell: null | string;
      items_count: number;
      items: Array<{
        type: string;
        job_id: string;
        title: string;
        employer_name: string;
        employer_url: string | null;
        description: string;
        salary: string | null;
        location: string;
        timestamp: string;
        url: string;
        apply_url: string | null;
      }>;
    }> | null;
  }>;
}
