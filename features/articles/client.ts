import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import type {
  ArticleAuthorOptionsResult,
  ArticleCreateInput,
  ArticleDetailDto,
  ArticleListResult,
  ArticleUpdateInput,
} from "./types";

type ApiOk<T> = {
  ok: true;
} & T;

type ApiFail = {
  ok: false;
  message?: string;
};

type ArticleListResponse = ApiOk<ArticleListResult> | ApiFail;

type ArticleDetailResponse =
  | ApiOk<{ article: ArticleDetailDto }>
  | ApiFail;

type ArticleAuthorOptionsResponse =
  | ApiOk<ArticleAuthorOptionsResult>
  | ApiFail;

export class ArticleClientError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function getErrorMessage(data: ApiFail | ApiOk<unknown> | null | undefined) {
  return data && "message" in data ? data.message : undefined;
}

function buildListParams(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  q?: string;
}) {
  const search = new URLSearchParams();

  if (params.page != null) search.set("page", String(params.page));
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  if (params.q?.trim()) search.set("q", params.q.trim());

  return search.toString();
}

export async function listArticlesClient(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  q?: string;
}): Promise<ArticleListResult> {
  const query = buildListParams(params);

  const res = await staffApiFetch(
    `/api/staff/articles/list${query ? `?${query}` : ""}`,
    {
      method: "GET",
      auth: true,
    },
  );

  const data = await parseJsonSafe<ArticleListResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors du chargement des articles",
      res.status,
    );
  }

  return {
    items: data.items,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
  };
}

export async function getArticleByIdClient(
  articleId: number,
): Promise<ArticleDetailDto> {
  const res = await staffApiFetch(`/api/staff/articles/${articleId}`, {
    method: "GET",
    auth: true,
  });

  const data = await parseJsonSafe<ArticleDetailResponse>(res);

  if (!res.ok || !data?.ok || !data.article) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors du chargement de l’article",
      res.status,
    );
  }

  return data.article;
}

export async function createArticleClient(
  input: ArticleCreateInput,
): Promise<ArticleDetailDto> {
  const res = await staffApiFetch(`/api/staff/articles`, {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await parseJsonSafe<ArticleDetailResponse>(res);

  if (!res.ok || !data?.ok || !data.article) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors de la création de l’article",
      res.status,
    );
  }

  return data.article;
}

export async function updateArticleClient(
  articleId: number,
  input: ArticleUpdateInput,
): Promise<ArticleDetailDto> {
  const res = await staffApiFetch(`/api/staff/articles/${articleId}`, {
    method: "PUT",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await parseJsonSafe<ArticleDetailResponse>(res);

  if (!res.ok || !data?.ok || !data.article) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors de la mise à jour de l’article",
      res.status,
    );
  }

  return data.article;
}

export async function publishArticleClient(articleId: number): Promise<void> {
  const res = await staffApiFetch(`/api/staff/articles/${articleId}/publish`, {
    method: "POST",
    auth: true,
  });

  const data = await parseJsonSafe<ApiOk<Record<string, never>> | ApiFail>(res);

  if (!res.ok || !data?.ok) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors de la publication de l’article",
      res.status,
    );
  }
}

export async function unpublishArticleClient(articleId: number): Promise<void> {
  const res = await staffApiFetch(`/api/staff/articles/${articleId}/unpublish`, {
    method: "POST",
    auth: true,
  });

  const data = await parseJsonSafe<ApiOk<Record<string, never>> | ApiFail>(res);

  if (!res.ok || !data?.ok) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors de la dépublication de l’article",
      res.status,
    );
  }
}

export async function deleteArticleClient(articleId: number): Promise<void> {
  const res = await staffApiFetch(`/api/staff/articles/${articleId}`, {
    method: "DELETE",
    auth: true,
  });

  const data = await parseJsonSafe<ApiOk<Record<string, never>> | ApiFail>(res);

  if (!res.ok || !data?.ok) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors de la suppression de l’article",
      res.status,
    );
  }
}

export async function listArticleAuthorOptionsClient(params: {
  articleId?: number | null;
  q?: string;
}): Promise<ArticleAuthorOptionsResult> {
  const search = new URLSearchParams();

  if (params.articleId != null) {
    search.set("articleId", String(params.articleId));
  }

  if (params.q?.trim()) {
    search.set("q", params.q.trim());
  }

  const res = await staffApiFetch(
    `/api/staff/articles/authors${search.toString() ? `?${search.toString()}` : ""}`,
    {
      method: "GET",
      auth: true,
    },
  );

  const data = await parseJsonSafe<ArticleAuthorOptionsResponse>(res);

  if (!res.ok || !data?.ok) {
    throw new ArticleClientError(
      getErrorMessage(data) || "Erreur lors du chargement des auteurs",
      res.status,
    );
  }

  return {
    items: data.items,
  };
}

