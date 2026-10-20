import type {ReactNode} from 'react';
import type {Product} from '@site/src/data/products';
import DocumentationTable from '@site/src/components/DocumentationTable';

export function SpecTable({product}: {product: Product}): ReactNode {
  return (
    <>
      {product.specs.map((group) => (
        <div key={group.title}>
          <h3>{group.title}</h3>
          <DocumentationTable className="mo-spec-table">
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </DocumentationTable>
        </div>
      ))}
    </>
  );
}
