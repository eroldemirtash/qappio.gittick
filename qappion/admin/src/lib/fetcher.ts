export async function jget<T = any>(url: string): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const response = await fetch(fullUrl, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function jpost<T = any>(url: string, data: any): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const response = await fetch(fullUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function jpatch<T = any>(url: string, data: any): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const response = await fetch(fullUrl, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function jdelete<T = any>(url: string): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const response = await fetch(fullUrl, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
